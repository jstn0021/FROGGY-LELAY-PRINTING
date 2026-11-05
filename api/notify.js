// POST /api/notify  { orderId, pickupNote? }
// Only a logged-in admin can call this. It emails the customer that the order is
// ready for pickup, then marks the order as "ready".
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { buildEmail } from './_email.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    GMAIL_USER,
    GMAIL_APP_PASSWORD,
    STORE_NAME,
    STORE_ADDRESS,
    STORE_HOURS,
  } = process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return res.status(500).json({
      error:
        'Email is not set up yet. Add SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GMAIL_USER and GMAIL_APP_PASSWORD in Vercel, then redeploy.',
    });
  }

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return res.status(401).json({ error: 'Please log in again.' });

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1) Who is calling? Must be a logged-in user listed in the admins table.
  const { data: userData, error: userError } = await db.auth.getUser(token);
  const email = userData?.user?.email?.toLowerCase();
  if (userError || !email) return res.status(401).json({ error: 'Please log in again.' });

  const { data: adminRow } = await db.from('admins').select('email').eq('email', email).maybeSingle();
  if (!adminRow) return res.status(403).json({ error: 'This account is not an admin.' });

  // 2) Which order?
  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body || {};
  const orderId = String(body.orderId || '');
  const note = String(body.pickupNote || '').slice(0, 300);
  if (!UUID.test(orderId)) return res.status(400).json({ error: 'Invalid order.' });

  const { data: order, error: orderError } = await db
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();
  if (orderError) return res.status(500).json({ error: 'Could not load the order.' });
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  // 3) Send the email.
  const message = buildEmail(order, {
    storeName: STORE_NAME || 'Lelay Store: Ink & Crafts',
    address: STORE_ADDRESS,
    hours: STORE_HOURS,
    note,
  });

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });
    await transporter.sendMail({
      from: `"${(STORE_NAME || 'Lelay Store: Ink & Crafts').replace(/"/g, '')}" <${GMAIL_USER}>`,
      to: order.customer_email,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  } catch (err) {
    console.error('sendMail failed:', err?.message);
    return res.status(502).json({
      error: 'Could not send the email. Check the Gmail address and app password in Vercel.',
    });
  }

  // 4) Mark as ready only after the email went out.
  const { error: updateError } = await db
    .from('orders')
    .update({ status: 'ready', notified_at: new Date().toISOString() })
    .eq('id', orderId);
  if (updateError) {
    return res.status(500).json({ error: 'Email sent, but the order status could not be updated.' });
  }

  return res.status(200).json({ ok: true });
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
