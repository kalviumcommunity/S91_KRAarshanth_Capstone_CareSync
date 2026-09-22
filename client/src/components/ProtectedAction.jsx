import { useAuth } from '../context/AuthContext';
export default function ProtectedAction({ roles, children }) { const { user } = useAuth(); return roles.includes(user?.role) ? children : null; }
