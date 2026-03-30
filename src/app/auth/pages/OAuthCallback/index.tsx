import { useEffect, useRef, useState, type CSSProperties, type FormEventHandler } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import apiClient from '@shared/api/api/client';
import { authService } from '@shared/api/auth/authService';

import { useAuthStore } from '@store/authStore';

import { API_CONFIG } from '@config/apiConfig';

const signupCommandSchema = z.object({
  orgName: z.string().trim().min(1, 'Please enter your organization name'),
  teamName: z.string().trim().min(1, 'Please enter your team name'),
});

function getOAuthSignupErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const record = error as {
      data?: {
        error?: {
          message?: string;
        };
      };
    };
    const message = record.data?.error?.message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }

  return 'No team found with that name and org. Contact your IT admin.';
}

/**
 * Completes the OAuth callback flow and redirects back into the app shell.
 */
export function OAuthCallbackSuccess(): JSX.Element {
  const navigate = useNavigate();
  const applyAuthPayload = useAuthStore((state) => state.applyAuthPayload);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) {
      return;
    }

    done.current = true;

    authService
      .completeOAuthLogin()
      .then((payload) => {
        if (!payload || !applyAuthPayload(payload)) {
          toast.error('OAuth login failed. Please try again.');
          navigate('/login', { replace: true });
          return;
        }

        navigate('/overview', { replace: true });
      })
      .catch(() => {
        toast.error('OAuth login failed. Please try again.');
        navigate('/login', { replace: true });
      });
  }, [applyAuthPayload, navigate]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0a0a0f',
        color: '#fff',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(99,102,241,0.3)',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Completing sign-in…</p>
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  );
}

/**
 * Completes the signup form that is shown after OAuth redirects with pending data.
 */
export function OAuthSignupPage(): JSX.Element {
  const navigate = useNavigate();
  const applyAuthPayload = useAuthStore((state) => state.applyAuthPayload);
  const [searchParams] = useSearchParams();

  const nameParam = searchParams.get('name') ?? '';
  const emailParam = searchParams.get('email') ?? '';

  const [orgName, setOrgName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const command = signupCommandSchema.safeParse({
      orgName,
      teamName,
    });
    if (!command.success) {
      setError(command.error.issues[0]?.message ?? 'Please complete the signup form');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.OAUTH.COMPLETE_SIGNUP,
        command.data
      );

      const payload = authService.normalizeAuthPayload(response);
      if (payload && applyAuthPayload(payload)) {
        navigate('/overview', { replace: true });
      } else {
        setError('Signup succeeded but the session could not be loaded. Please try again.');
      }
    } catch (err: unknown) {
      setError(getOAuthSignupErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div
          style={{
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="4"
              y="15"
              width="24"
              height="13"
              rx="4"
              stroke="#6366F1"
              strokeWidth="2"
              fill="rgba(99, 102, 241, 0.15)"
            />
            <rect
              x="8"
              y="9"
              width="16"
              height="13"
              rx="4"
              stroke="#22D3EE"
              strokeWidth="2"
              fill="rgba(34, 211, 238, 0.1)"
            />
            <rect
              x="12"
              y="3"
              width="8"
              height="13"
              rx="4"
              stroke="#FFFFFF"
              strokeWidth="2"
              fill="none"
            />
          </svg>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0 }}>
            Almost there
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.55)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Hi <strong style={{ color: '#fff' }}>{nameParam || emailParam}</strong>! Enter your
            organization and team to complete sign-up.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <label style={labelStyle}>
            Organization Name
            <input
              type="text"
              value={orgName}
              onChange={(event) => setOrgName(event.target.value)}
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
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="e.g. Platform Engineering"
              required
              style={inputStyle}
              id="teamName"
            />
          </label>

          {error && (
            <p
              style={{
                fontSize: '13px',
                color: '#f87171',
                background: 'rgba(248,113,113,0.1)',
                padding: '10px 14px',
                borderRadius: '8px',
                margin: 0,
              }}
            >
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
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at top, #0d0d1a 0%, #0a0a0f 60%)',
  padding: '24px',
  fontFamily: "'Inter', sans-serif",
};

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: '420px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
  padding: '36px 32px',
  backdropFilter: 'blur(20px)',
};

const labelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  fontSize: '13px',
  fontWeight: 500,
  color: 'rgba(255,255,255,0.65)',
};

const inputStyle: CSSProperties = {
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.05)',
  color: '#fff',
  fontSize: '15px',
  outline: 'none',
  transition: 'border-color 0.2s',
};
