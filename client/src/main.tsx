import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import App from "./App";
import "./index.css";

// Global error handler for production debugging
window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.error || event.message);
  // Send to server for logging
  fetch('/api/client-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: event.message,
      stack: event.error?.stack,
      url: window.location.href
    })
  }).catch(() => {});
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
  // Send to server for logging
  fetch('/api/client-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Unhandled Promise Rejection',
      stack: event.reason?.stack || String(event.reason),
      url: window.location.href
    })
  }).catch(() => {});
});

try {
  createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  );
} catch (error) {
  console.error('[Root Render Error]', error);
  document.body.innerHTML = `<div style="padding: 20px; font-family: sans-serif;">
    <h1>Application Error</h1>
    <p>Failed to start application. Check console for details.</p>
    <pre>${error}</pre>
  </div>`;
}
