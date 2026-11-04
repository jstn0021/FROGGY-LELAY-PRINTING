import SectionHead from './SectionHead.jsx';

const steps = [
  ['Send your file', 'Message us the PDF with your order summary, or bring it on a flash drive.'],
  ['Confirm the proof', 'We send a preview and the final price. Print starts once you say yes.'],
  ['Pick up or delivery', 'Pay on pickup or through GCash. Delivery is arranged for larger orders.'],
];

export default function Steps() {
  return (
    <section className="band alt" id="order">
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
