// Builds the "ready for pickup" email. The leading underscore keeps Vercel from
// exposing this file as an API route.

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function peso(n) {
  const num = Number(n) || 0;
  return (
    '₱' +
    num.toLocaleString('en-PH', {
      minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}

export function buildEmail(order, opts = {}) {
  const storeName = opts.storeName || 'Lelay Store: Ink & Crafts';
  const address = opts.address || '';
  const hours = opts.hours || '';
  const note = (opts.note || '').trim();

  const ref = String(order.id).slice(0, 8).toUpperCase();
  const qty = Number(order.quantity);
  const unit = Number(order.unit_price);
  const discountPct = Number(order.discount_pct) || 0;
  const subtotal = Math.round(unit * qty * 100) / 100;
  const discountAmount = Math.round((subtotal - Number(order.total)) * 100) / 100;
  const hasDiscount = discountPct > 0;

  const rows = [
    ['Order reference', ref],
    ['Item', `${order.service_name} (${order.option_label})`],
    ['Quantity', String(qty)],
    ['Price each', peso(unit)],
    ['Subtotal', peso(subtotal)],
  ];
  if (hasDiscount) rows.push([`Discount (${discountPct}%)`, `-${peso(discountAmount)}`]);
  rows.push(['Total to pay', peso(order.total)]);

  const subject = `Your order is ready for pickup (${ref}) | ${storeName}`;

  const textLines = [
    `Hi ${order.customer_name},`,
    '',
    'Good news! Your order is done and ready for pickup.',
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
  ];
  if (note) textLines.push('', `Message from the store: ${note}`);
  if (address) textLines.push('', `Pickup address: ${address}`);
  if (hours) textLines.push(`Store hours: ${hours}`);
  textLines.push('', 'Please show your order reference when you pick up.', '', `Thank you,`, storeName);

  const rowHtml = rows
    .map(([k, v], i) => {
      const last = i === rows.length - 1;
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;font-size:14px">${esc(k)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;font-size:${last ? 18 : 14}px;font-weight:${last ? 700 : 500};color:#2a2a2e">${esc(v)}</td>
      </tr>`;
    })
    .join('');

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f4f4f6;font-family:Arial,Helvetica,sans-serif;color:#2a2a2e">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden">
    <div style="background:#666;padding:20px 24px;color:#fff">
      <div style="font-size:20px;font-weight:700;font-style:italic">${esc(storeName)}</div>
    </div>
    <div style="height:6px;background:linear-gradient(90deg,#0AA9DD,#FF5AAB,#FFF200)"></div>
    <div style="padding:24px">
      <p style="margin:0 0 8px;font-size:16px">Hi ${esc(order.customer_name)},</p>
      <p style="margin:0 0 20px;font-size:16px;line-height:1.5">Good news! Your order is done and <strong>ready for pickup</strong>.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${rowHtml}</table>
      ${note ? `<p style="margin:20px 0 0;padding:12px 14px;background:#FFFBCF;border-radius:10px;font-size:14px;line-height:1.5"><strong>Message from the store:</strong> ${esc(note)}</p>` : ''}
      ${address || hours ? `<p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#555">${address ? `<strong>Pickup address:</strong> ${esc(address)}<br>` : ''}${hours ? `<strong>Store hours:</strong> ${esc(hours)}` : ''}</p>` : ''}
      <p style="margin:20px 0 0;font-size:14px;color:#555">Please show your order reference when you pick up.</p>
      <p style="margin:24px 0 0;font-size:14px">Thank you,<br><strong>${esc(storeName)}</strong></p>
    </div>
  </div>
</body></html>`;

  return { subject, text: textLines.join('\n'), html };
}

// ---------------------------------------------------------------------------
// "We received your order" (to the customer) and "New order" (to the store)
// ---------------------------------------------------------------------------

function wrap(storeName, inner) {
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f4f4f6;font-family:Arial,Helvetica,sans-serif;color:#2a2a2e">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden">
    <div style="background:#666;padding:20px 24px;color:#fff">
      <div style="font-size:20px;font-weight:700;font-style:italic">${esc(storeName)}</div>
    </div>
    <div style="height:6px;background:linear-gradient(90deg,#0AA9DD,#FF5AAB,#FFF200)"></div>
    <div style="padding:24px">${inner}</div>
  </div>
</body></html>`;
}

function table(rows) {
  const body = rows
    .map(
      ([k, v]) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;font-size:14px">${esc(k)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;font-size:14px;font-weight:500;color:#2a2a2e">${esc(v)}</td>
      </tr>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${body}</table>`;
}

function orderRows(order) {
  const qty = Number(order.quantity);
  const unit = Number(order.unit_price);
  return [
    ['Order reference', String(order.id).slice(0, 8).toUpperCase()],
    ['Item', `${order.service_name} (${order.option_label})`],
    ['Quantity', String(qty)],
    ['Price each', peso(unit)],
    ['Estimated total', peso(order.total)],
  ];
}

export function buildReceivedEmail(order, opts = {}) {
  const storeName = opts.storeName || 'Lelay Store: Ink & Crafts';
  const ref = String(order.id).slice(0, 8).toUpperCase();
  const rows = orderRows(order);
  const hasFile = Boolean(order.file_path || order.file_link);

  const subject = `We received your order (${ref}) | ${storeName}`;
  const text = [
    `Hi ${order.customer_name},`,
    '',
    'Salamat! We received your order. We will email you again when it is ready for pickup.',
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    hasFile ? 'We got your file.' : 'No file yet? Send it to the store by message and mention your reference.',
    'The shop confirms the final price after checking your file.',
    '',
    'Thank you,',
    storeName,
  ].join('\n');

  const html = wrap(
    storeName,
    `<p style="margin:0 0 8px;font-size:16px">Hi ${esc(order.customer_name)},</p>
     <p style="margin:0 0 20px;font-size:16px;line-height:1.5">Salamat! We <strong>received your order</strong>. We will email you again when it is ready for pickup.</p>
     ${table(rows)}
     <p style="margin:20px 0 0;font-size:14px;line-height:1.5;color:#555">${
       hasFile
         ? 'We got your file.'
         : 'No file yet? Send it to the store by message and mention your reference.'
     } The shop confirms the final price after checking your file.</p>
     <p style="margin:24px 0 0;font-size:14px">Thank you,<br><strong>${esc(storeName)}</strong></p>`
  );
  return { subject, text, html };
}

export function buildStoreAlert(order, opts = {}) {
  const storeName = opts.storeName || 'Lelay Store: Ink & Crafts';
  const ref = String(order.id).slice(0, 8).toUpperCase();
  const rows = [
    ...orderRows(order),
    ['Customer', order.customer_name],
    ['Email', order.customer_email],
    ['Phone', order.customer_phone || '-'],
    ['Uploaded file', order.file_path ? 'Yes (see dashboard)' : 'No'],
    ['File link', order.file_link || '-'],
  ];
  const desc = String(order.description || '').trim();

  const subject = `New order ${ref}: ${order.service_name}`;
  const text = [
    'A new order just came in.',
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    desc ? `\nDetails: ${desc}` : '',
    '',
    'Open the admin dashboard to start it.',
  ].join('\n');

  const html = wrap(
    storeName,
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.5"><strong>New order</strong> just came in.</p>
     ${table(rows)}
     ${desc ? `<p style="margin:20px 0 0;padding:12px 14px;background:#FFFBCF;border-radius:10px;font-size:14px;line-height:1.5"><strong>Details:</strong> ${esc(desc)}</p>` : ''}
     <p style="margin:20px 0 0;font-size:14px;color:#555">Open the admin dashboard to start it.</p>`
  );
  return { subject, text, html };
}
