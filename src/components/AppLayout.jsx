import { NavLink, Outlet } from "react-router-dom";
import LedgrMark from "./LedgrMark";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/import", label: "Import & Add" },
  { to: "/transactions", label: "Transactions" },
  { to: "/chat", label: "Coach Chat" },
];

function AppLayout({ darkMode, onSignOut, onToggleDarkMode, plannerHealthTone, saveStatus, userEmail }) {
  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="workspace-header">
          <div>
            <LedgrMark className="workspace-brand" />
            <h1 className="workspace-title">A simple place to track your budget, imports, and financial insights.</h1>
            <p className="workspace-subtitle">
              Move through Ledgr's overview, imports, transaction history, and coaching tools without losing your place.
            </p>
          </div>

          <div className="workspace-meta">
            <div className="account-chip">
              <span>{userEmail}</span>
              <span className={`save-indicator ${saveStatus}`}>
                {saveStatus === "saving" ? "Saving" : saveStatus === "error" ? "Save issue" : "Synced"}
              </span>
            </div>
            <div className={`health-pill health-pill-${plannerHealthTone}`}>
              {plannerHealthTone === "on-track" && "Planner health: On track"}
              {plannerHealthTone === "watchlist" && "Planner health: Watch expenses"}
              {plannerHealthTone === "needs-attention" && "Planner health: Balance is negative"}
            </div>
            <div className="workspace-actions">
              <button type="button" onClick={onToggleDarkMode} className="secondary-button">
                {darkMode ? "Light mode" : "Dark mode"}
              </button>
              <button type="button" onClick={onSignOut} className="ghost-button">
                Sign out
              </button>
            </div>
          </div>
        </header>

        <nav className="workspace-nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `workspace-nav-link ${isActive ? "active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
