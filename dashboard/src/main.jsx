import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Dashboard from "./Dashboard.jsx";
import TestPage from "./pages/TestPage.jsx";
import BlueBarPage from "./pages/BlueBarPage.jsx";
import "./index.css";
import "leaflet/dist/leaflet.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  document.body.innerHTML =
    '<p style="padding:2rem;font-family:system-ui">Error: missing &lt;div id="root"&gt; in index.html</p>';
} else {
  try {
    const root = ReactDOM.createRoot(rootEl);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <HashRouter>
            <Routes>
              <Route path="/blue" element={<BlueBarPage />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </HashRouter>
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (err) {
    rootEl.innerHTML = `<div style="padding:2rem;font-family:system-ui;background:#fff1f2;color:#991b1b"><strong>React failed to start</strong><pre>${String(err)}</pre></div>`;
    console.error(err);
  }
}
