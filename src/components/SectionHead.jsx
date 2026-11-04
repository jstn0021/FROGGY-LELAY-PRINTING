export default function SectionHead({ eyebrow, title, children, style }) {
  return (
    <div className="section-head" style={style}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
    </div>
  );
}
