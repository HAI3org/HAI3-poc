import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Get the root element from the DOM
const rootElement = document.getElementById('root');

// Check if the root element exists
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Create a root and render the app
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
