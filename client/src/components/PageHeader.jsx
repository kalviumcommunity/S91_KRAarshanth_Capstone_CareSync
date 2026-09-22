export default function PageHeader({ eyebrow = 'Operations', title, description, action = null }) {
  return (
    <div className="page-heading">
      <div>
        <span className="kicker">{eyebrow}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
