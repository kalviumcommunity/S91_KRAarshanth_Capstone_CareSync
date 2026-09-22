import { Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { Activity, BedDouble, CalendarDays, Hospital, LayoutDashboard, LogOut, Menu, ShieldCheck, Stethoscope, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Departments from './pages/Departments';
import Beds from './pages/Beds';
import Appointments from './pages/Appointments';
import Unauthorized from './pages/Unauthorized';

function ProtectedRoute() { const { user, loading } = useAuth(); if (loading) return <div className="screen-center">Loading IHROS…</div>; return user ? <Outlet /> : <Navigate to="/login" replace />; }
function RoleRoute({ roles }) { const { user } = useAuth(); return roles.includes(user?.role) ? <Outlet /> : <Navigate to="/unauthorized" replace />; }

function Shell() {
  const { user, logout } = useAuth(); const [open, setOpen] = useState(false); const navigate = useNavigate();
  const links = [
    ['/','Dashboard',LayoutDashboard], ['/doctors','Doctors',Stethoscope], ['/patients','Patients',Users], ['/departments','Departments',Hospital], ['/beds','Beds',BedDouble], ['/appointments','Appointments',CalendarDays]
  ];
  const signOut = () => { logout(); navigate('/login'); };
  return <div className="app-shell">
    <aside className={open ? 'sidebar open' : 'sidebar'}>
      <div className="brand"><div className="brand-mark"><Activity size={20}/></div><div><strong>IHROS</strong><span>Resource Intelligence</span></div></div>
      <nav>{links.map(([to,label,Icon]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}><Icon size={18}/>{label}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="user-card"><div className="avatar">{user?.name?.[0]?.toUpperCase()}</div><div><b>{user?.name}</b><span>{user?.role}</span></div></div><button className="logout" onClick={signOut}><LogOut size={17}/> Sign out</button></div>
    </aside>
    {open && <button className="backdrop" onClick={() => setOpen(false)} aria-label="Close menu"/>}
    <main className="main"><header className="topbar"><button className="menu" onClick={() => setOpen(v => !v)}>{open ? <X/> : <Menu/>}</button><div><span className="eyebrow">Hospital Operations</span><h1>Intelligent Resource Command Center</h1></div><div className="top-actions"><span className="role-pill"><ShieldCheck size={15}/> {user?.role}</span></div></header><section className="content"><Outlet/></section></main>
  </div>;
}

export default function App() { return <Routes>
  <Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/unauthorized" element={<Unauthorized/>}/>
  <Route element={<ProtectedRoute/>}><Route element={<Shell/>}>
    <Route path="/" element={<Dashboard/>}/><Route path="/doctors" element={<Doctors/>}/><Route path="/patients" element={<Patients/>}/><Route path="/departments" element={<Departments/>}/><Route path="/beds" element={<Beds/>}/><Route path="/appointments" element={<Appointments/>}/>
    <Route element={<RoleRoute roles={['super_admin','hospital_admin']}/>}><Route path="/admin" element={<Dashboard/>}/></Route>
  </Route></Route>
  <Route path="*" element={<Navigate to="/" replace/>}/>
</Routes>; }
