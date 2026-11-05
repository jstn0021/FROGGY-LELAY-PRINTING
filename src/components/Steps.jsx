import SectionHead from './SectionHead.jsx';

const steps = [
  [
    'Fill out the order form',
    'Pick what you need, add your name and email, and describe your print. Add a link to your file if you have one.',
  ],
  [
    'We work on it',
    'The shop checks your file and prints it. Final price is confirmed by the shop.',
  ],
  [
    'Get an email, then pick up',
    'When your order is ready, we email you the price and discount, if any. Show your order reference at pickup.',
  ],
];

export default function Steps() {
  return (
    <section id="order">
      <div className="wrap section">
        <SectionHead eyebrow="How to order" title="Tatlong hakbang" />
        <ol className="steps">
          {steps.map(([title, text]) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
