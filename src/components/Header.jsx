const links = [
  ['#services', 'Services'],
  ['#quote', 'Quote'],
  ['#prep', 'File prep'],
  ['#order', 'How to order'],
  ['#contact', 'Contact'],
];

export default function Header() {
  return (
    <header className="wrap top">
      <a className="brand" href="#top" aria-label="Tinta Printing, back to top">
        <span className="dots" aria-hidden="true">
          <i></i>
          <i></i>
          <i></i>
        </span>
        <b>Tinta</b>
        <span>Printing</span>
      </a>
      <nav className="nav" aria-label="Page sections">
        {links.map(([href, label]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
