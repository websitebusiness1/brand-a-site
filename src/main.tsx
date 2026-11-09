import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { CartProvider } from './lib/cart';
import { SiteProvider } from './site/SiteProvider';
import { isSupabaseConfigured } from './lib/supabase';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isSupabaseConfigured ? (
      <BrowserRouter>
        <CartProvider>
          <SiteProvider>
            <App />
          </SiteProvider>
        </CartProvider>
      </BrowserRouter>
    ) : (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
        <h1 className="h-display text-5xl">Not configured</h1>
        <p className="mt-4 text-white/60">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example), then rebuild.</p>
      </div>
    )}
  </StrictMode>,
);
