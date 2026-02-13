import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

try {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  } else {
    console.error("Root element not found");
  }
} catch (e) {
  console.error("Mounting error:", e);
  document.body.innerHTML = `<div style="color:red; padding:20px; font-family:monospace;">FAILED TO MOUNT APP:<br/>${e}</div>`;
}
