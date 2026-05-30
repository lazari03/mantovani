import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppRoutes from './AppRoutes';
import { I18nProvider } from './lib/i18nContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <AppRoutes />
    </I18nProvider>
  </StrictMode>
);
