import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="wrap foot">
        <span>
          © 2026 Lelay Store, Ink &amp; Crafts. Hours and contact details are placeholders to replace
          with the store's own.
        </span>
        <Link to="/admin">Admin</Link>
      </div>
    </footer>
  );
}
