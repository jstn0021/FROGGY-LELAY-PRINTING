import SectionHead from './SectionHead.jsx';

const tips = [
  ['File type', 'PDF is best. Word files and clear JPG or PNG images also work.'],
  ['Paper size', 'Tell us if it is short bond, A4 or long bond, so the price is right.'],
  [
    'E-Gov ID',
    'Send a clear, straight photo or screenshot of the ID. We resize it to 2.13 × 3.37 inches.',
  ],
  [
    'Glossy photos',
    'Use the highest quality image you have. Blurry or tiny images print blurry.',
  ],
];

export default function FilePrep() {
  return (
    <section id="prep">
      <div className="wrap section">
        <SectionHead eyebrow="Before you send" title="Tips for a good print">
          Four quick checks so your print comes out right the first time.
        </SectionHead>
        <dl className="check">
          {tips.map(([term, text]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
