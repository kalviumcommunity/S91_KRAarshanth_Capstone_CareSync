import { GoogleLogin } from '@react-oauth/google';

export default function GoogleSignIn({ onSuccess, onError }) {
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return <p className="muted" role="status">Google sign-in is unavailable. Configure VITE_GOOGLE_CLIENT_ID to enable it.</p>;
  }

  return <div className="google-sign-in">
    <div className="auth-divider"><span>or continue with</span></div>
    <GoogleLogin
      onSuccess={({ credential }) => credential ? onSuccess(credential) : onError('Google did not return an identity credential.')}
      onError={() => onError('Google sign-in could not be completed. Please try again.')}
      useOneTap={false}
    />
  </div>;
}
