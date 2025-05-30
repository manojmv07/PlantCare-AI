
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// The Gemini API key check is more robustly handled within geminiService.ts,
// where it prevents API calls if the key is missing.
// The Google Maps API key is loaded directly in index.html.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to. Make sure an element with id='root' exists in your HTML.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);