import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GROUPS, products, findProduct, computeTotal } from '../data/products.js';
import { peso } from '../utils/format.js';
import { supabase, supabaseReady } from '../lib/supabase.js';

const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100 MB, same as the Supabase bucket limit
const BUCKET = 'order-files';

const prettySize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// Keep only safe characters so the storage path is always valid.
function safeFileName(name) {
  const clean = name.normalize('NFKD').replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^\.+/, '');
  const dot = clean.lastIndexOf('.');
  const ext = dot > 0 ? clean.slice(dot).slice(0, 12) : '';
  const base = (dot > 0 ? clean.slice(0, dot) : clean).slice(0, 80) || 'file';
  return `${base}${ext}`;
}

export default function Order() {
  const [params] = useSearchParams();
  const wanted = params.get('service');
  const [serviceId, setServiceId] = useState(findProduct(wanted) ? wanted : products[0].id);
  const [optionIdx, setOptionIdx] = useState(0);
  const [qtyText, setQtyText] = useState('1');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    fileLink: '',
    website: '', // honeypot, real people leave this empty
  });
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const fileInput = useRef(null);
  const [state, setState] = useState({ status: 'idle', error: '', ref: '', email: '' });

  const product = findProduct(serviceId);
  const option = product.opts[optionIdx] ?? product.opts[0];
  const qty = Number(qtyText);
  const qtyValid = Number.isInteger(qty) && qty >= 1 && qty <= 9999;
  const total = qtyValid ? computeTotal(option.price, qty) : 0;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function onFileChange(e) {
    const picked = e.target.files?.[0] ?? null;
    setFileError('');
    if (picked && picked.size > MAX_FILE_BYTES) {
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
      setFileError(`That file is ${prettySize(picked.size)}. The limit is 100 MB.`);
      return;
    }
    setFile(picked);
  }

  function clearFile() {
    setFile(null);
    setFileError('');
    if (fileInput.current) fileInput.current.value = '';
  }

  function onServiceChange(e) {
    setServiceId(e.target.value);
    setOptionIdx(0);
  }

  async function submit(e) {
    e.preventDefault();
    if (form.website) return;
    if (!qtyValid) {
      setState({ status: 'error', error: 'Enter a quantity from 1 to 9999.', ref: '', email: '' });
      return;
    }
    if (!supabaseReady) {
      setState({
        status: 'error',
        error: 'The order system is not connected yet. Please message the store directly.',
        ref: '',
        email: '',
      });
      return;
    }
    setState({ status: 'sending', error: '', ref: '', email: '' });

    const id = crypto.randomUUID();
    const email = form.email.trim();

    // Upload first. The order is only saved if the file went through.
    let filePath = null;
    if (file) {
      if (file.size > MAX_FILE_BYTES) {
        setState({ status: 'error', error: 'Your file is over 100 MB.', ref: '', email: '' });
        return;
      }
      filePath = `${id}/${safeFileName(file.name)}`;
      const { error: upError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, { contentType: file.type || 'application/octet-stream' });
      if (upError) {
        setState({
          status: 'error',
          error: 'Your file could not be uploaded. Check your internet and try again, or send the file by message.',
          ref: '',
          email: '',
        });
        return;
      }
    }
    const { error } = await supabase.from('orders').insert({
      id,
      customer_name: form.name.trim(),
      customer_email: email,
      customer_phone: form.phone.trim() || null,
      service_id: product.id,
      service_name: product.name,
      option_label: option.label,
      quantity: qty,
      unit_price: option.price,
      description: form.description.trim() || null,
      file_link: form.fileLink.trim() || null,
      file_path: filePath,
    });

    if (error) {
      setState({
        status: 'error',
        error: 'Sorry, your order was not sent. Please check your details and try again.',
        ref: '',
        email: '',
      });
      return;
    }
    // Fire and forget: the order is already saved even if the email fails.
    fetch('/api/order-received', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: id }),
    }).catch(() => {});

    setState({ status: 'done', error: '', ref: id.slice(0, 8).toUpperCase(), email });
  }

  function reset() {
    setForm({ name: '', email: '', phone: '', description: '', fileLink: '', website: '' });
    setQtyText('1');
    clearFile();
    setState({ status: 'idle', error: '', ref: '', email: '' });
  }

  if (state.status === 'done') {
    return (
      <main className="wrap section">
        <div className="card done">
          <p className="eyebrow">Order sent</p>
          <h1 className="page-title">Salamat! Natanggap na namin ang order mo.</h1>
          <p className="ref-box">
            Order reference <b>{state.ref}</b>
          </p>
          <p>
            We will email <b>{state.email}</b> when your order is ready for pickup. Please keep your
            reference number and show it when you pick up.
          </p>
          <p className="help">
            No file yet? Send it to the store by message and mention your reference.
          </p>
          <div className="actions">
            <button className="btn primary" type="button" onClick={reset}>
              Make another order
            </button>
            <Link className="btn" to="/">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="wrap section">
      <div className="section-head">
        <p className="eyebrow">Order form</p>
        <h1 className="page-title">Mag-order na</h1>
        <p>Fill out your details and describe what you want printed. We will email you when it is ready.</p>
      </div>

      {!supabaseReady ? (
        <p className="notice warn">
          Supabase is not connected yet, so orders cannot be saved. Add the keys from .env.example.
        </p>
      ) : null}

      <div className="order-grid">
        <form className="card form" onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" required maxLength={120} autoComplete="name" value={form.name} onChange={set('name')} />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required maxLength={200} autoComplete="email" value={form.email} onChange={set('email')} />
              <span className="help">We send the pickup notice here.</span>
            </div>
            <div className="field">
              <label htmlFor="phone">Phone (optional)</label>
              <input id="phone" type="tel" maxLength={40} autoComplete="tel" value={form.phone} onChange={set('phone')} />
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="service">What do you need?</label>
              <select id="service" value={serviceId} onChange={onServiceChange}>
                {GROUPS.map((g) => (
                  <optgroup key={g.id} label={g.title}>
                    {products
                      .filter((p) => p.group === g.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="option">Paper size or type</label>
              <select id="option" value={optionIdx} onChange={(e) => setOptionIdx(Number(e.target.value))}>
                {product.opts.map((o, i) => (
                  <option key={o.label} value={i}>
                    {o.label} ({peso(o.price)})
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="qty">Quantity ({product.plural})</label>
              <input id="qty" type="number" inputMode="numeric" min="1" max="9999" step="1" required value={qtyText} onChange={(e) => setQtyText(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="description">Order details</label>
            <textarea
              id="description"
              maxLength={1500}
              value={form.description}
              onChange={set('description')}
              placeholder="Example: 12 pages, double-sided, color. Or: E-Gov ID, front and back on one page."
            />
            <span className="help">Tell us the pages, sides, color or size, and anything we should know.</span>
          </div>

          <div className="field">
            <label htmlFor="file">Upload your file (optional)</label>
            <input
              id="file"
              ref={fileInput}
              className="file-input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.psd,.ai,.zip,image/*"
              onChange={onFileChange}
              disabled={state.status === 'sending'}
            />
            {file ? (
              <span className="help">
                {file.name} ({prettySize(file.size)}){' '}
                <button type="button" className="linklike" onClick={clearFile} disabled={state.status === 'sending'}>
                  Remove
                </button>
              </span>
            ) : (
              <span className="help">PDF, image, Word, PowerPoint, Excel or ZIP. Up to 100 MB.</span>
            )}
            {fileError ? <span className="notice error" role="alert">{fileError}</span> : null}
          </div>

          <div className="field">
            <label htmlFor="fileLink">Or a link to your file (optional)</label>
            <input id="fileLink" type="url" maxLength={500} placeholder="https://drive.google.com/..." value={form.fileLink} onChange={set('fileLink')} />
            <span className="help">Google Drive or other link. Set it so anyone with the link can view.</span>
          </div>

          <div className="hp" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
          </div>

          {state.status === 'error' ? <p className="notice error" role="alert">{state.error}</p> : null}

          <button className="btn primary" type="submit" disabled={state.status === 'sending'}>
            {state.status === 'sending' ? (file ? 'Uploading file… please wait' : 'Sending…') : 'Send order'}
          </button>
        </form>

        <aside className="card summary" aria-live="polite">
          <p className="eyebrow">Your estimate</p>
          <p className="total">{peso(total)}</p>
          <dl className="lines">
            <div>
              <dt>Item</dt>
              <dd>{product.name}</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{option.label}</dd>
            </div>
            <div>
              <dt>Price each</dt>
              <dd>{peso(option.price)}</dd>
            </div>
            <div>
              <dt>Quantity</dt>
              <dd>{qtyValid ? qty : '-'}</dd>
            </div>
          </dl>
          <p className="help">
            The shop confirms the final price after checking your file. Any discount is added by the
            shop and shown in your pickup email.
          </p>
        </aside>
      </div>
    </main>
  );
}
