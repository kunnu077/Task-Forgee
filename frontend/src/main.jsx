import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#2d2923',
            color: '#e8e6e0',
            border: '1px solid #504942',
            borderRadius: '10px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#1e1b17' },
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: '#1e1b17' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
