import { Link } from 'react-router-dom';
import { GROUPS, products } from '../data/products.js';
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
            <dd>{peso(o.price)}</dd>
          </div>
        ))}
      </dl>
      <Link className="svc-link" to={`/order?service=${product.id}`}>
        Order this
      </Link>
    </article>
  );
}

export default function Services() {
  return (
    <section id="services" style={{ marginTop: 'clamp(2.5rem,6vw,4.5rem)' }}>
      <div className="wrap section">
        <SectionHead eyebrow="Price list" title="What we offer">
          Prices are per page, print or sheet as shown. Any discount is added by the shop and shown
          in your pickup email.
        </SectionHead>
        {GROUPS.map((g) => (
          <div className="group" key={g.id}>
            <h3 className="group-title">{g.title}</h3>
            <div className="grid">
              {products
                .filter((p) => p.group === g.id)
                .map((p) => (
                  <ServiceCard key={p.id} product={p} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
