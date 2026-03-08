import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import api from '@shared/api/api/client';
import { API_CONFIG } from '@config/apiConfig';
import { authService } from '@shared/api/auth/authService';

// ─── /oauth/success ───────────────────────────────────────────────────────────

export const OAuthCallbackSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const token = searchParams.get('token');
    if (!token) {
      toast.error('OAuth login failed. No token returned.');
      navigate('/login', { replace: true });
      return;
    }

    authService.loginWithToken(token).then(() => {
      navigate('/overview', { replace: true });
    }).catch(() => {
      toast.error('OAuth login failed. Please try again.');
      navigate('/login', { replace: true });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0f', color: '#fff', flexDirection: 'column', gap: '12px' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Completing sign-in…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── /oauth/signup ────────────────────────────────────────────────────────────

export const OAuthSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const pendingToken = searchParams.get('pending') ?? '';
  const nameParam = searchParams.get('name') ?? '';
  const emailParam = searchParams.get('email') ?? '';

  const [orgName, setOrgName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !teamName.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.OAUTH.COMPLETE_SIGNUP, {
        pendingToken,
        orgName: orgName.trim(),
        teamName: teamName.trim(),
      });

      // normalise – same shape as login
      const payload = authService.normalizeAuthPayload(response);
      if (payload?.token) {
        await authService.loginWithToken(String(payload.token));
        navigate('/overview', { replace: true });
      } else {
        setError('Signup succeeded but no token was returned. Please try again.');
      }
    } catch (err: unknown) {
      const anyErr = err as { status?: number; data?: { error?: { message?: string } } };
      const msg = anyErr?.data?.error?.message ?? 'No team found with that name and org. Contact your IT admin.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!pendingToken) {
    return (
      <div style={pageStyle}>
        <p style={{ color: '#f87171' }}>Invalid signup link. Please try signing in again.</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Brand icon */}
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="15" width="24" height="13" rx="4" stroke="#6366F1" strokeWidth="2" fill="rgba(99, 102, 241, 0.15)" />
            <rect x="8" y="9" width="16" height="13" rx="4" stroke="#22D3EE" strokeWidth="2" fill="rgba(34, 211, 238, 0.1)" />
            <rect x="12" y="3" width="8" height="13" rx="4" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          </svg>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0 }}>Almost there</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', margin: 0, textAlign: 'center' }}>
            Hi <strong style={{ color: '#fff' }}>{nameParam || emailParam}</strong>! Enter your organization and team to complete sign-up.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={labelStyle}>
            Organization Name
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Acme Inc"
              required
              style={inputStyle}
              id="orgName"
            />
          </label>

          <label style={labelStyle}>
            Team Name
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Platform Engineering"
              required
              style={inputStyle}
              id="teamName"
            />
          </label>

          {error && (
            <p style={{ fontSize: '13px', color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '10px 14px', borderRadius: '8px', margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !orgName.trim() || !teamName.trim()}
            id="btnCompleteSignup"
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '15px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {isLoading ? 'Joining…' : 'Complete Sign-up'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at top, #0d0d1a 0%, #0a0a0f 60%)',
  padding: '24px',
  fontFamily: "'Inter', sans-serif",
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '420px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
  padding: '36px 32px',
  backdropFilter: 'blur(20px)',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  fontSize: '13px',
  fontWeight: 500,
  color: 'rgba(255,255,255,0.65)',
};

const inputStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.05)',
  color: '#fff',
  fontSize: '15px',
  outline: 'none',
  transition: 'border-color 0.2s',
};
