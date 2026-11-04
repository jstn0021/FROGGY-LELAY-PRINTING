import SectionHead from './SectionHead.jsx';

// Placeholder details. Replace with the shop's real ones.
const details = [
  ['Phone / Viber', '0900 000 0000'],
  ['Messenger', 'm.me/your-shop-page'],
  ['Email', 'hello@your-shop.example'],
  ['Address', 'Your shop address here'],
];

export default function Contact() {
  return (
    <section className="band" id="contact">
      <div className="wrap section">
        <div className="contact">
          <SectionHead
            eyebrow="Contact"
            title="Dumaan o mag-message"
            style={{ marginBottom: 0 }}
          >
            Walk-ins are welcome. For tarpaulin and bulk orders, message first so we can confirm
            the schedule.
          </SectionHead>

          <dl>
            {details.map(([term, value]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
            <div>
              <dt>Hours</dt>
              <dd className="plain">
                Mon to Sat, 8:00 AM to 7:00 PM
                <br />
                Sun, 9:00 AM to 3:00 PM
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
