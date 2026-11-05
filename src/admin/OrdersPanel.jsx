import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { peso } from '../utils/format.js';

const STATUSES = ['pending', 'ongoing', 'ready', 'finished'];
const LABEL = {
  pending: 'Pending',
  ongoing: 'Ongoing',
  ready: 'Ready for pickup',
  finished: 'Finished',
};

const when = (iso) =>
  new Date(iso).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' });

function OrderCard({ order, onUpdate, onDelete }) {
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [discount, setDiscount] = useState(String(order.discount_pct));
  const [note, setNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => setDiscount(String(order.discount_pct)), [order.discount_pct]);

  const ref = order.id.slice(0, 8).toUpperCase();
  const subtotal = Number(order.unit_price) * order.quantity;
  const discountChanged = Number(discount) !== Number(order.discount_pct);

  async function setStatus(status) {
    setBusy(status);
    setMsg({ type: '', text: '' });
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', order.id)
      .select()
      .single();
    setBusy('');
    if (error) setMsg({ type: 'error', text: error.message });
    else onUpdate(data);
  }

  async function saveDiscount() {
    const d = Number(discount);
    if (!(d >= 0 && d <= 100)) {
      setMsg({ type: 'error', text: 'Discount must be from 0 to 100.' });
      return;
    }
    setBusy('discount');
    setMsg({ type: '', text: '' });
    const { data, error } = await supabase
      .from('orders')
      .update({ discount_pct: d })
      .eq('id', order.id)
      .select()
      .single();
    setBusy('');
    if (error) setMsg({ type: 'error', text: error.message });
    else {
      onUpdate(data);
      setMsg({
        type: 'ok',
        text:
          order.status === 'ready'
            ? 'Discount saved. Use "Resend email" so the customer sees the new total.'
            : 'Discount saved.',
      });
    }
  }

  async function sendReady() {
    setBusy('email');
    setMsg({ type: '', text: '' });
    try {
      const { data: s } = await supabase.auth.getSession();
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${s.session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ orderId: order.id, pickupNote: note.trim() }),
      });
      let body = {};
      try {
        body = await res.json();
      } catch {
        /* not JSON */
      }
      if (!res.ok) {
        throw new Error(
          body.error ||
            `The email service was not found (HTTP ${res.status}). It only works on Vercel, or locally with "vercel dev".`
        );
      }
      const { data: row } = await supabase.from('orders').select('*').eq('id', order.id).single();
      if (row) onUpdate(row);
      setMsg({ type: 'ok', text: `Email sent to ${order.customer_email}.` });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setBusy('');
    }
  }

  async function openFile() {
    setBusy('file');
    setMsg({ type: '', text: '' });
    const { data, error } = await supabase.storage.from('order-files').createSignedUrl(order.file_path, 600, {
      download: true,
    });
    setBusy('');
    if (error || !data?.signedUrl) setMsg({ type: 'error', text: error?.message || 'Could not open the file.' });
    else window.location.href = data.signedUrl;
  }

  async function remove() {
    setBusy('delete');
    if (order.file_path) await supabase.storage.from('order-files').remove([order.file_path]);
    const { error } = await supabase.from('orders').delete().eq('id', order.id);
    setBusy('');
    if (error) setMsg({ type: 'error', text: error.message });
    else onDelete(order.id);
  }

  return (
    <article className={`order s-${order.status}`}>
      <header className="order-head">
        <div>
          <h3>{order.customer_name}</h3>
          <p className="help">
            #{ref} · {when(order.created_at)}
          </p>
        </div>
        <span className={`pill s-${order.status}`}>{LABEL[order.status]}</span>
      </header>

      <div className="order-body">
        <dl className="detail">
          <div>
            <dt>Item</dt>
            <dd>
              {order.service_name}
              <br />
              <span className="help">{order.option_label}</span>
            </dd>
          </div>
          <div>
            <dt>Quantity</dt>
            <dd>
              {order.quantity} × {peso(order.unit_price)} = {peso(subtotal)}
            </dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>
              <b>{peso(order.total)}</b>
              {Number(order.discount_pct) > 0 ? <span className="help"> ({order.discount_pct}% off)</span> : null}
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd className="wrapany">{order.customer_email}</dd>
          </div>
          {order.customer_phone ? (
            <div>
              <dt>Phone</dt>
              <dd>{order.customer_phone}</dd>
            </div>
          ) : null}
          {order.notified_at ? (
            <div>
              <dt>Emailed</dt>
              <dd>{when(order.notified_at)}</dd>
            </div>
          ) : null}
        </dl>

        {order.description || order.file_link || order.file_path ? (
          <div className="notes">
            {order.description ? <p>{order.description}</p> : null}
            {order.file_path ? (
              <p>
                <button className="btn sm cyan" type="button" disabled={!!busy} onClick={openFile}>
                  {busy === 'file' ? 'Opening…' : 'Download uploaded file'}
                </button>{' '}
                <span className="help wrapany">{order.file_path.split('/').slice(1).join('/')}</span>
              </p>
            ) : null}
            {order.file_link ? (
              <p>
                <a href={order.file_link} target="_blank" rel="noopener noreferrer">
                  Open file link
                </a>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {order.status !== 'finished' ? (
        <div className="order-tools">
          <div className="field inline">
            <label htmlFor={`d-${order.id}`}>Discount %</label>
            <input
              id={`d-${order.id}`}
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
            {discountChanged ? (
              <button className="btn sm" type="button" disabled={busy === 'discount'} onClick={saveDiscount}>
                Save
              </button>
            ) : null}
          </div>
          {order.status !== 'ready' ? (
            <div className="field inline grow">
              <label htmlFor={`n-${order.id}`}>Message to customer (optional)</label>
              <input
                id={`n-${order.id}`}
                maxLength={300}
                placeholder="Example: Please bring the exact amount."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {msg.text ? <p className={`notice ${msg.type === 'error' ? 'error' : 'okmsg'}`}>{msg.text}</p> : null}

      <footer className="order-actions">
        {order.status === 'pending' ? (
          <button className="btn sm cyan" type="button" disabled={!!busy} onClick={() => setStatus('ongoing')}>
            {busy === 'ongoing' ? 'Saving…' : 'Start (ongoing)'}
          </button>
        ) : null}
        {order.status === 'pending' || order.status === 'ongoing' ? (
          <button className="btn sm primary" type="button" disabled={!!busy} onClick={sendReady}>
            {busy === 'email' ? 'Sending…' : 'Ready for pickup + email'}
          </button>
        ) : null}
        {order.status === 'ready' ? (
          <>
            <button className="btn sm" type="button" disabled={!!busy} onClick={sendReady}>
              {busy === 'email' ? 'Sending…' : 'Resend email'}
            </button>
            <button className="btn sm primary" type="button" disabled={!!busy} onClick={() => setStatus('finished')}>
              {busy === 'finished' ? 'Saving…' : 'Finish'}
            </button>
          </>
        ) : null}
        <span className="spacer" />
        {confirmDelete ? (
          <>
            <span className="help">Delete this order?</span>
            <button className="btn sm danger" type="button" disabled={!!busy} onClick={remove}>
              {busy === 'delete' ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button className="btn sm" type="button" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button className="btn sm ghost" type="button" disabled={!!busy} onClick={() => setConfirmDelete(true)}>
            Delete
          </button>
        )}
      </footer>
    </article>
  );
}

export default function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('active');
  const [query, setQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearMsg, setClearMsg] = useState('');

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (err) setError(err.message);
    else {
      setError('');
      setOrders(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel('orders-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const counts = useMemo(() => {
    const c = { pending: 0, ongoing: 0, ready: 0, finished: 0 };
    orders.forEach((o) => {
      if (c[o.status] !== undefined) c[o.status] += 1;
    });
    return c;
  }, [orders]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter === 'active' && o.status === 'finished') return false;
      if (STATUSES.includes(filter) && o.status !== filter) return false;
      if (!q) return true;
      return [o.customer_name, o.customer_email, o.customer_phone, o.service_name, o.id.slice(0, 8)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [orders, filter, query]);

  const onUpdate = (row) => setOrders((list) => list.map((o) => (o.id === row.id ? row : o)));
  const onDelete = (id) => setOrders((list) => list.filter((o) => o.id !== id));

  async function clearFinished() {
    setClearMsg('');
    const paths = orders.filter((o) => o.status === 'finished' && o.file_path).map((o) => o.file_path);
    if (paths.length) await supabase.storage.from('order-files').remove(paths);
    const { error: err } = await supabase.from('orders').delete().eq('status', 'finished');
    setConfirmClear(false);
    if (err) setClearMsg(err.message);
    else {
      setClearMsg('Finished orders deleted.');
      load();
    }
  }

  const chips = [
    ['active', `Active (${counts.pending + counts.ongoing + counts.ready})`],
    ['pending', `Pending (${counts.pending})`],
    ['ongoing', `Ongoing (${counts.ongoing})`],
    ['ready', `Ready (${counts.ready})`],
    ['finished', `Finished (${counts.finished})`],
    ['all', `All (${orders.length})`],
  ];

  return (
    <section>
      <div className="stats">
        {STATUSES.map((s) => (
          <button key={s} type="button" className={`stat s-${s}`} onClick={() => setFilter(s)}>
            <b>{counts[s]}</b>
            <span>{LABEL[s]}</span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="chips" role="tablist" aria-label="Filter orders">
          {chips.map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={filter === key} className={filter === key ? 'chip on' : 'chip'} onClick={() => setFilter(key)}>
              {label}
            </button>
          ))}
        </div>
        <div className="toolbar-right">
          <input
            className="search"
            type="search"
            placeholder="Search name, email, reference…"
            aria-label="Search orders"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn sm" type="button" onClick={load}>
            Refresh
          </button>
        </div>
      </div>

      {counts.finished > 0 ? (
        <div className="cleanup">
          <p>
            <b>{counts.finished}</b> finished {counts.finished === 1 ? 'order is' : 'orders are'} still stored. Delete them to keep your database small.
          </p>
          {confirmClear ? (
            <div className="row">
              <button className="btn sm danger" type="button" onClick={clearFinished}>
                Yes, delete {counts.finished}
              </button>
              <button className="btn sm" type="button" onClick={() => setConfirmClear(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="btn sm" type="button" onClick={() => setConfirmClear(true)}>
              Delete all finished
            </button>
          )}
        </div>
      ) : null}
      {clearMsg ? <p className="notice okmsg">{clearMsg}</p> : null}
      {error ? <p className="notice error">{error}</p> : null}

      {loading ? (
        <p className="help">Loading orders…</p>
      ) : shown.length === 0 ? (
        <div className="empty">
          <b>No orders here.</b>
          <span>New orders from the order form show up here automatically.</span>
        </div>
      ) : (
        <div className="orders">
          {shown.map((o) => (
            <OrderCard key={o.id} order={o} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}
