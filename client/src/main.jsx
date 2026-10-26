import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles.css';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const application = <BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter>;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{clientId ? <GoogleOAuthProvider clientId={clientId}>{application}</GoogleOAuthProvider> : application}</React.StrictMode>
);
