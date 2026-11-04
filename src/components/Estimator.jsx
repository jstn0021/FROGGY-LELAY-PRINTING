import { useEffect, useRef, useState } from 'react';
import { products, BULK_DISCOUNT } from '../data/products.js';
import { peso } from '../utils/format.js';
import SectionHead from './SectionHead.jsx';

export default function Estimator() {
  const [productIdx, setProductIdx] = useState(2); // Business cards
  const [optionIdx, setOptionIdx] = useState(0);
  const [qtyText, setQtyText] = useState('200');
  const [status, setStatus] = useState('');
  const summaryRef = useRef(null);

  const product = products[productIdx];
  const option = product.opts[optionIdx] ?? product.opts[0];
  const qty = Math.max(1, Math.floor(Number(qtyText) || 1));
  const gross = option.price * qty;
  const discounted = product.bulk !== null && qty >= product.bulk;
  const total = discounted ? Math.round(gross * (1 - BULK_DISCOUNT) * 100) / 100 : gross;
  const word = qty === 1 ? product.noun : product.plural;
  const percent = Math.round(BULK_DISCOUNT * 100);

  const summary = [
    'Order request: Tinta Printing',
    `Item: ${product.name}, ${option.label}`,
    `Quantity: ${qty} ${word}`,
    `Estimate: ${peso(total)}${discounted ? ` (${percent}% bulk discount)` : ''}`,
    `Turnaround: ${product.lead}`,
    'File: attached (PDF)',
  ].join('\n');

  // clear the "Copied." message whenever the summary changes
  useEffect(() => setStatus(''), [summary]);

  function onProductChange(e) {
    setProductIdx(Number(e.target.value));
    setOptionIdx(0);
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setStatus('Copied.');
    } catch {
      summaryRef.current?.focus();
      summaryRef.current?.select();
      setStatus('Press Ctrl+C to copy.');
    }
  }

  const bulkHint = product.bulk
    ? discounted
      ? `Bulk rate applied: ${percent}% off.`
      : `Order ${product.bulk} ${product.plural} or more to get ${percent}% off.`
    : 'No bulk discount on this item.';

  return (
    <section className="band alt" id="quote">
      <div className="wrap section">
        <SectionHead eyebrow="Quote estimator" title="Magkano ang ipapa-print mo?">
          Pick the item and quantity. Copy the summary and send it with your file.
        </SectionHead>

        <div className="quote">
          <form className="form" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
            <div className="field">
              <label htmlFor="product">Item</label>
              <select id="product" value={productIdx} onChange={onProductChange}>
                {products.map((p, i) => (
                  <option key={p.id} value={i}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="option">Size or type</label>
              <select
                id="option"
                value={optionIdx}
                onChange={(e) => setOptionIdx(Number(e.target.value))}
              >
                {product.opts.map((o, i) => (
                  <option key={o.label} value={i}>
                    {o.label} ({peso(o.price)} / {product.noun})
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="qty">Quantity ({product.plural})</label>
              <input
                id="qty"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={qtyText}
                onChange={(e) => setQtyText(e.target.value)}
              />
            </div>

            <p className="hint">{bulkHint}</p>
          </form>

          <div className="result" aria-live="polite">
            <div>
              <p className="eyebrow">Estimated total</p>
              <p className="total">{peso(total)}</p>
            </div>

            <dl className="lines">
              <div>
                <dt>Rate</dt>
                <dd>
                  {peso(option.price)} / {product.noun}
                </dd>
              </div>
              <div>
                <dt>Quantity</dt>
                <dd>
                  {qty} {word}
                </dd>
              </div>
              <div>
                <dt>Bulk discount</dt>
                <dd>{discounted ? `${percent}% off` : 'None'}</dd>
              </div>
              <div>
                <dt>Turnaround</dt>
                <dd>{product.lead}</dd>
              </div>
            </dl>

            <div className="field">
              <label htmlFor="summary">Order summary</label>
              <textarea id="summary" ref={summaryRef} value={summary} readOnly />
            </div>

            <div className="copyrow">
              <button className="btn primary" type="button" onClick={copySummary}>
                Copy summary
              </button>
              <span id="copystatus" role="status">
                {status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
