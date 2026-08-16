import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <button
        type="button"
        className="sidebar-backdrop"
        aria-label="Close navigation"
        onClick={() => setSidebarOpen(false)}
      />

      <div className="app-main">
        <header className="topbar">
          <button
            type="button"
            className="sidebar-toggle"
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="hamburger" />
          </button>
          <span className="topbar-brand">Fesa</span>
        </header>

        <main className="app-content" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}