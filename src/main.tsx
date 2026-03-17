import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { ErrorBoundary } from '@shared/components/ui/feedback';
import { queryClient } from '@shared/api/queryClient';

import App from './App';
import AppQueryClientProvider from './app/providers/QueryClientProvider';
import ThemeProvider from './app/providers/ThemeProvider';
import '@shared/utils/chartSetup';
import './index.css';

export { queryClient };

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root was not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppQueryClientProvider>
        <ThemeProvider>
          <ErrorBoundary showDetails={import.meta.env.DEV}>
            <App />
          </ErrorBoundary>
        </ThemeProvider>
      </AppQueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
