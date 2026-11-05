import { Link } from 'react-router-dom';
import Headline from './Headline.jsx';

export default function Hero({ cover }) {
  return (
    <div className="wrap">
      {cover.banner_on && cover.banner_text ? (
        <div className="banner" role="status">
          <span className="banner-tag">New</span>
          <span>{cover.banner_text}</span>
          <Link to="/order">Order now</Link>
        </div>
      ) : null}

      <section className="hero" aria-labelledby="h1">
        <div>
          <p className="eyebrow">{cover.eyebrow}</p>
          <h1 id="h1">
            <Headline text={cover.headline} highlight={cover.highlight} />
          </h1>
          <p className="lede">{cover.subtext}</p>
          <div className="actions">
            <Link className="btn primary" to="/order">
              Order now
            </Link>
            <a className="btn" href="#services">
              See price list
            </a>
          </div>
        </div>

        <figure className="sheet">
          <img
            src="/logo.jpg"
            alt="Lelay Store Ink & Crafts logo: a paw print with cyan, yellow and pink toes"
            width="640"
            height="640"
          />
        </figure>
      </section>

      <div className="facts">
        {cover.facts.map((f, i) => (
          <p key={i}>
            <b>{f.title}</b>
            {f.text}
          </p>
        ))}
      </div>
    </div>
  );
}
