import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthExpiryListener(): null {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthExpired = () => navigate('/login', { replace: true });
    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [navigate]);

  return null;
}
