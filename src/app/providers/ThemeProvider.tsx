import { ConfigProvider, theme as antdTheme } from 'antd';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

import { useAppStore } from '@store/appStore';

import { APP_COLORS } from '@config/colorLiterals';

import type { ReactNode } from 'react';

interface ThemeProviderProps {
  readonly children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const appTheme = useAppStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appTheme);
  }, [appTheme]);

  const themeConfig = {
    algorithm:
      appTheme === 'light'
        ? antdTheme.defaultAlgorithm
        : antdTheme.darkAlgorithm,
    token: {
      colorPrimary: APP_COLORS.hex_7c7ff2,
      colorSuccess: APP_COLORS.hex_52876b,
      colorWarning: APP_COLORS.hex_d97706,
      colorError: APP_COLORS.hex_dc2626,
      colorInfo: APP_COLORS.hex_4da6c8,
      borderRadius: 8,
      fontFamily:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    components: {
      Layout: {
        headerBg: 'var(--bg-secondary)',
        siderBg: 'var(--bg-secondary)',
        bodyBg: 'var(--bg-primary)',
      },
      Menu: {
        darkItemBg: 'var(--bg-secondary)',
        darkItemSelectedBg: 'var(--bg-tertiary)',
      },
    },
  };

  return (
    <ConfigProvider theme={themeConfig}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-text)',
            border: '1px solid var(--toast-border)',
          },
          success: {
            iconTheme: {
              primary: APP_COLORS.hex_52876b,
              secondary: APP_COLORS.hex_fff,
            },
          },
          error: {
            iconTheme: {
              primary: APP_COLORS.hex_dc2626,
              secondary: APP_COLORS.hex_fff,
            },
          },
        }}
      />
    </ConfigProvider>
  );
}
