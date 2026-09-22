import { LoaderCircle } from 'lucide-react';

export default function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="state-card loading-state" role="status" aria-live="polite">
      <LoaderCircle className="spin" size={18} />
      <span>{message}</span>
    </div>
  );
}
