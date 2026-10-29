import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Activity, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GoogleSignIn from '../components/GoogleSignIn';

export default function Login() {
  const { user, login, googleLogin } = useAuth(); const navigate = useNavigate(); const location = useLocation(); const [form,setForm]=useState({email:'',password:''}); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  if (user) return <Navigate to="/" replace />;
  const submit=async(e)=>{e.preventDefault();setError('');setBusy(true);try{await login(form);navigate(location.state?.from?.pathname||'/');}catch(err){setError(err.response?.data?.message||'Login failed. Check your credentials.');}finally{setBusy(false);}};
  const submitGoogle=async(credential)=>{setError('');try{await googleLogin(credential);navigate(location.state?.from?.pathname||'/');}catch(err){setError(err.response?.data?.message||'Google sign-in failed. Please try again.');}};
  return <AuthLayout title="Welcome back" subtitle="Sign in to the hospital operations command center."><form onSubmit={submit} className="auth-form"><label className="field"><span>Email</span><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></label><label className="field"><span>Password</span><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength="8"/></label>{error&&<div className="alert error">{error}</div>}<button className="primary full" disabled={busy}>{busy?'Signing in…':'Sign in securely'}</button><GoogleSignIn onSuccess={submitGoogle} onError={setError}/><p className="auth-switch">New administrator? <Link to="/register">Create account</Link></p></form></AuthLayout>
}
function AuthLayout({title,subtitle,children}){return <div className="auth-page"><div className="auth-visual"><div className="brand big"><div className="brand-mark"><Activity size={25}/></div><div><strong>IHROS</strong><span>Intelligent Hospital Resource Optimization</span></div></div><div className="visual-copy"><span className="kicker">Operational intelligence</span><h2>Turn hospital data into better resource decisions.</h2><p>Track capacity, staff availability, patient flow and appointments from one secure workspace.</p><div className="security-note"><ShieldCheck/><span>JWT-protected role-based access</span></div></div></div><div className="auth-panel"><div className="auth-box"><LockKeyhole className="auth-icon"/><h1>{title}</h1><p>{subtitle}</p>{children}</div></div></div>}
