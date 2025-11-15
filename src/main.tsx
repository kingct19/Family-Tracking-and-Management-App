import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';
import { registerFirebaseMessagingSW } from './lib/utils/register-service-worker';

// Register Firebase Messaging service worker
if ('serviceWorker' in navigator) {
    registerFirebaseMessagingSW().catch(console.error);
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
