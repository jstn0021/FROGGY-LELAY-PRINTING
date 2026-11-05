import { Link } from 'react-router-dom';

const links = [
  ['/#services', 'Price list'],
  ['/#prep', 'Before you send'],
  ['/#order', 'How to order'],
  ['/#contact', 'Contact'],
];

export default function Header() {
  return (
    <header className="wrap top">
      <Link className="brand" to="/" aria-label="Lelay Store Ink & Crafts, home">
        <img className="logo" src="/logo.jpg" alt="" width="46" height="46" />
        <b>Lelay Store</b>
        <span>Ink &amp; Crafts</span>
      </Link>
      <nav className="nav" aria-label="Page sections">
        {links.map(([href, label]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>
      <Link className="btn primary sm" to="/order">
        Order now
      </Link>
    </header>
  );
}
