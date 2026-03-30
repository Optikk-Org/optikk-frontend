import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@store/authStore';

export default function AuthExpiryListener(): null {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthExpired = () => {
      useAuthStore.getState().clearSession();
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [navigate]);

  return null;
}
