import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GoogleSignIn from '../components/GoogleSignIn';

export default function Register() {
  const { register, googleLogin } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const submit = async (event) => {
    event.preventDefault(); setErrors({}); setError('');
    if (form.password.length < 8) { setErrors({ password: 'Password must be at least 8 characters' }); return; }
    setBusy(true);
    try { await register(form); nav('/'); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed.'); }
    finally { setBusy(false); }
  };
  const submitGoogle = async (credential) => {
    setError('');
    try { await googleLogin(credential); nav('/'); }
    catch (err) { setError(err.response?.data?.message || 'Google sign-in failed.'); }
  };
  return <div className="auth-page"><div className="auth-panel full-panel"><div className="auth-box">
    <h1>Create IHROS account</h1><p>New accounts start with nurse-level access. A hospital administrator can assign additional permissions.</p>
    <form onSubmit={submit} className="auth-form">
      <label className="field"><span>Full name</span><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required minLength="2" maxLength="80" /></label>
      <label className="field"><span>Email</span><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label>
      <label className="field"><span>Password</span><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength="8" maxLength="128" /><small>Use at least 8 characters.</small>{errors.password && <small className="error-text">{errors.password}</small>}</label>
      {error && <div className="alert error">{error}</div>}
      <button className="primary full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      <GoogleSignIn onSuccess={submitGoogle} onError={setError} />
      <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
    </form>
  </div></div></div>;
}
