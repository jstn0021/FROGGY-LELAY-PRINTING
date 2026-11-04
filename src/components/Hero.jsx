const facts = [
  ['Same day', 'Documents, lamination and IDs'],
  ['Up to 5 × 8 ft', 'Tarpaulin with eyelets'],
  ['300 gsm', 'Business cards, matte or glossy'],
];

export default function Hero() {
  return (
    <div className="wrap">
      <section className="hero" aria-labelledby="h1">
        <div>
          <p className="eyebrow">Digital &amp; large format printing</p>
          <h1 id="h1" style={{ marginTop: '0.9rem' }}>
            Print na <em>malinaw.</em> Kahit last minute.
          </h1>
          <p className="lede">
            Documents, tarpaulin, business cards, stickers at thesis binding. Ipadala ang file mo,
            kunin mo mamaya o ipa-deliver.
          </p>
          <div className="actions">
            <a className="btn primary" href="#quote">
              Get a quote
            </a>
            <a className="btn" href="#services">
              See rates
            </a>
          </div>
        </div>

        <figure className="sheet" style={{ margin: 0 }}>
          <svg
            viewBox="0 0 400 400"
            role="img"
            aria-label="Cyan, magenta and yellow circles overprinting on a press sheet with crop marks and a registration target"
          >
            <path
              className="mark"
              d="M30 0V22M370 0V22M30 378V400M370 378V400M0 30H22M0 370H22M378 30H400M378 370H400"
            />
            <circle className="mark" cx="200" cy="12" r="6" />
            <path className="mark" d="M192 12H208M200 4V20" />
            <circle className="c" cx="150" cy="150" r="100" />
            <circle className="m" cx="250" cy="150" r="100" />
            <circle className="y" cx="200" cy="235" r="100" />
          </svg>
          <figcaption>
            <span style={{ '--sw': 'var(--c)' }}>Cyan</span>
            <span style={{ '--sw': 'var(--m)' }}>Magenta</span>
            <span style={{ '--sw': 'var(--y)' }}>Yellow</span>
          </figcaption>
        </figure>
      </section>

      <div className="facts">
        {facts.map(([big, small]) => (
          <p key={big}>
            <b>{big}</b>
            {small}
          </p>
        ))}
      </div>
    </div>
  );
}
