// POST /api/order-received  { orderId }
// Called by the order form right after a customer places an order.
// Emails the customer a receipt and alerts the store. Anyone can call it, so it only
// works for a brand-new order (under 15 minutes old) and sends at most once per order.
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { buildReceivedEmail, buildStoreAlert } from './_email.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FRESH_MS = 15 * 60 * 1000;
const MAX_PER_EMAIL_PER_HOUR = 5;

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
    STORE_NOTIFY_EMAIL,
  } = process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return res.status(500).json({ error: 'Email is not set up yet.' });
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body || {};
  const orderId = String(body.orderId || '');
  if (!UUID.test(orderId)) return res.status(400).json({ error: 'Invalid order.' });

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Claim the order first so a double call cannot send two emails.
  const since = new Date(Date.now() - FRESH_MS).toISOString();
  const { data: order, error } = await db
    .from('orders')
    .update({ confirmation_sent_at: new Date().toISOString() })
    .eq('id', orderId)
    .is('confirmation_sent_at', null)
    .gte('created_at', since)
    .select('*')
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Could not load the order.' });
  if (!order) return res.status(200).json({ ok: true, skipped: true });

  // Stop one address from being flooded with confirmations.
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await db
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('customer_email', order.customer_email)
    .gte('confirmation_sent_at', hourAgo)
    .neq('id', orderId);
  const throttled = (count ?? 0) >= MAX_PER_EMAIL_PER_HOUR;

  const storeName = STORE_NAME || 'Lelay Store: Ink & Crafts';
  const from = `"${storeName.replace(/"/g, '')}" <${GMAIL_USER}>`;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });

  const jobs = [];
  if (!throttled) {
    const m = buildReceivedEmail(order, { storeName });
    jobs.push(transporter.sendMail({ from, to: order.customer_email, ...m }));
  }
  const alert = buildStoreAlert(order, { storeName });
  jobs.push(transporter.sendMail({ from, to: STORE_NOTIFY_EMAIL || GMAIL_USER, ...alert }));

  const results = await Promise.allSettled(jobs);
  results.forEach((r) => {
    if (r.status === 'rejected') console.error('sendMail failed:', r.reason?.message);
  });

  return res.status(200).json({ ok: true });
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
