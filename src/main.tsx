import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import SessionProvider from './features/auth/context/SessionProvider';
import './index.css';
import { useKstMidnightRollover } from './lib/useKstMidnightRollover';
import QueryProvider from './providers/QueryProvider';
import { router } from './router/router';
import FloatingTopButton from './components/FloatingTopButton';

function GlobalRolloverProvider() {
  useKstMidnightRollover();
  return <RouterProvider router={router} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IntlProvider locale='ko-KR'>
      <QueryProvider>
        <SessionProvider>
          <GlobalRolloverProvider />
        </SessionProvider>
      </QueryProvider>
    </IntlProvider>
    <Toaster />
    <FloatingTopButton threshold={240} />
  </StrictMode>
);
