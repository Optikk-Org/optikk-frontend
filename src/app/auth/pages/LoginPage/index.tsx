import { Form, Input } from 'antd';
import { Surface, Button } from '@shared/design-system';
import { Mail, Lock, Layers } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';

import { APP_COLORS } from '@config/colorLiterals';

import './LoginPage.css';


interface LoginFormValues {
  email: string;
  password: string;
}

const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email')
    .email('Please enter a valid email'),
  password: z.string().min(1, 'Please enter your password'),
});

/**
 *
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const { setTimeRange } = useAppStore();
  const [form] = Form.useForm<LoginFormValues>();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/overview');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (values: LoginFormValues): Promise<void> => {
    const parsed = loginFormSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Please check your login details');
      return;
    }

    const result = await login(parsed.data.email, parsed.data.password);
    if (result.success) {
      // Normalize post-login view window for load-test verification.
      setTimeRange('30m');
      toast.success('Login successful!');
      navigate('/overview');
    }
  };

  return (
    <div className="login-container">
      <div className="login-branding">
        <div className="login-branding-content">
          <div className="branding-logo">
            <div className="branding-logo-icon">
              <Layers size={24} />
            </div>
            <h2 style={{ margin: 0, color: APP_COLORS.hex_fff }}>
              Optikk
            </h2>
          </div>

          <h3 style={{ color: APP_COLORS.hex_fff, marginBottom: 16 }}>
            Modern Observability Platform
          </h3>

          <p style={{ fontSize: 16, color: APP_COLORS.rgba_255_255_255_0p7 }}>
            Monitor, analyze, and optimize your distributed systems with real-time insights.
          </p>

          <div className="branding-features">
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div>
                <div className="feature-title">Real-time Metrics</div>
                <div className="feature-desc">Track performance and health</div>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔍</div>
              <div>
                <div className="feature-title">Distributed Tracing</div>
                <div className="feature-desc">Debug across microservices</div>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📝</div>
              <div>
                <div className="feature-title">Centralized Logs</div>
                <div className="feature-desc">Search and analyze logs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-section">
        <Surface className="login-card" padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
            <div>
              <h3 style={{ marginBottom: 8 }}>
                Welcome back
              </h3>
              <span style={{ color: 'var(--text-secondary)' }}>Sign in to your account to continue</span>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              requiredMark={false}
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input
                  data-testid="login-email"
                  prefix={<Mail size={16} style={{ color: APP_COLORS.hex_666 }} />}
                  placeholder="frontend.demo@observability.local"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password
                  data-testid="login-password"
                  prefix={<Lock size={16} style={{ color: APP_COLORS.hex_666 }} />}
                  placeholder="Enter your password"
                  size="large"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  data-testid="login-submit"
                  variant="primary"
                  type="submit"
                  fullWidth
                  loading={isLoading}
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <div className="login-demo-info">
              <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                Demo credentials: <strong>frontend.demo@observability.local</strong> / Demo@12345
              </span>
            </div>
          </div>
        </Surface>
      </div>
    </div>
  );
}
