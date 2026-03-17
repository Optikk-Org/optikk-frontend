import { QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query';

import type { ReactNode } from 'react';
import { queryClient } from '@shared/api/queryClient';

import QueryLifecycleBridge from './QueryLifecycleBridge';

export { queryClient };

interface AppQueryClientProviderProps {
  readonly children: ReactNode;
}

export default function AppQueryClientProvider({
  children,
}: AppQueryClientProviderProps): JSX.Element {
  return (
    <TanstackQueryClientProvider client={queryClient}>
      <QueryLifecycleBridge>{children}</QueryLifecycleBridge>
    </TanstackQueryClientProvider>
  );
}
