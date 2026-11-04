import SectionHead from './SectionHead.jsx';

const checks = [
  ['File type', 'PDF is best. A high-resolution JPG or PNG works for a single image.'],
  ['Resolution', '300 dpi at final print size. For tarpaulin, 100 dpi at full size is enough.'],
  [
    'Color',
    'Design in CMYK if you can. Bright screen colors, especially neon blue and green, print duller.',
  ],
  ['Fonts', 'Convert text to outlines or embed the fonts, so nothing changes when we open your file.'],
];

export default function FilePrep() {
  return (
    <section className="band" id="prep">
      <div className="wrap section">
        <SectionHead eyebrow="File prep" title="Ready-to-print files">
          Four checks that save you a reprint.
        </SectionHead>

        <div className="prep">
          <div className="diagram">
            <svg
              viewBox="0 0 96 61"
              role="img"
              aria-label="Business card layout showing bleed, trim line and safe area"
            >
              <rect className="bleed" x="0.2" y="0.2" width="95.6" height="60.6" />
              <rect className="trim" x="3" y="3" width="90" height="55" />
              <rect className="ph2" x="12" y="12" width="14" height="14" />
              <rect className="ph" x="32" y="13" width="40" height="3" />
              <rect className="ph" x="32" y="19" width="28" height="3" />
              <rect className="ph" x="12" y="44" width="52" height="2.5" />
              <rect className="safe" x="8" y="8" width="80" height="45" />
            </svg>
            <ul className="key">
              <li>
                <i className="k-bleed"></i>
                <span>
                  <b>Bleed, 3 mm.</b> Run backgrounds and photos to this edge.
                </span>
              </li>
              <li>
                <i className="k-trim"></i>
                <span>
                  <b>Trim line, 90 × 55 mm.</b> Where the card is cut.
                </span>
              </li>
              <li>
                <i className="k-safe"></i>
                <span>
                  <b>Safe area, 5 mm in.</b> Keep text and logos inside.
                </span>
              </li>
            </ul>
          </div>

          <dl className="check">
            {checks.map(([term, text]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
