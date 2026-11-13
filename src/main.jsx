import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { RatesProvider } from './lib/rates';
import { StoreProvider } from './lib/store';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RatesProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </RatesProvider>
    </BrowserRouter>
  </StrictMode>,
);
