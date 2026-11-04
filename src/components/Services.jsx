import { products } from '../data/products.js';
import { peso } from '../utils/format.js';
import SectionHead from './SectionHead.jsx';

function ServiceCard({ product }) {
  const min = Math.min(...product.opts.map((o) => o.price));
  return (
    <article className="svc">
      <div className="svc-head">
        <h3>{product.name}</h3>
        <p className="from">
          from <b>{peso(min)}</b> / {product.noun}
        </p>
      </div>
      <p className="desc">{product.desc}</p>
      <dl className="rates">
        {product.opts.map((o) => (
          <div key={o.label}>
            <dt>{o.label}</dt>
            <dd>
              {peso(o.price)} / {product.noun}
            </dd>
          </div>
        ))}
      </dl>
      <p className="lead">
        Turnaround <b>{product.lead}</b>
      </p>
    </article>
  );
}

export default function Services() {
  return (
    <section className="band" id="services" style={{ marginTop: 'clamp(2.5rem,6vw,4.5rem)' }}>
      <div className="wrap section">
        <SectionHead eyebrow="Services and rates" title="What we print">
          Sample rates in pesos. Final price is confirmed after we check your file.
        </SectionHead>
        <div className="grid">
          {products.map((p) => (
            <ServiceCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
