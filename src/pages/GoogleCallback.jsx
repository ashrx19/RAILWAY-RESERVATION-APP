import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { completeGoogleLogin } = useAuth();
  const [message, setMessage] = useState('Completing Google sign-in...');

  useEffect(() => {
    const finish = async () => {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');
      const token = params.get('token');
      if (error || !token) { setMessage(error || 'Google sign-in did not return a token.'); return; }
      try {
        const user = await completeGoogleLogin(token);
        navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      } catch {
        setMessage('Unable to complete Google sign-in. Please try again.');
      }
    };
    finish();
  }, [completeGoogleLogin, navigate]);

  return <div style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>{message}</div>;
}
