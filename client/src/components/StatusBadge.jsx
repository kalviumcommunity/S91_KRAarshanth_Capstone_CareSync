export default function StatusBadge({ tone = 'success', children }) {
  return <span className={`status-badge ${tone}`}><span className="status-dot" />{children}</span>;
}
