import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { completeGoogleLogin } = useAuth();
  const [message, setMessage] = useState('Completing Google sign-in...');

  useEffect(() => {
    const finish = async () => {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');
      const code = params.get('code');
      const state = params.get('state');
      if (error || !code || !state) { setMessage(error || 'Google sign-in did not return valid authorization data.'); return; }
      try {
        const exchange = await api.post('/auth/google/exchange', { code, state });
        const user = await completeGoogleLogin(exchange.data.token);
        navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      } catch {
        setMessage('Unable to complete Google sign-in. Please try again.');
      }
    };
    finish();
  }, [completeGoogleLogin, navigate]);

  return <div style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>{message}</div>;
}
