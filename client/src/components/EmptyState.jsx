import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', message = 'No records are available.' }) {
  return (
    <div className="state-card empty-state">
      <Inbox size={20} />
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}
