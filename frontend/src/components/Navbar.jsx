import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  function linkClass({ isActive }) {
    return isActive ? 'active-link' : '';
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/">
          <span>📚</span> Library MS
        </NavLink>
      </div>

      <div className="navbar-actions">
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          type="button"
          className="navbar-toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className={`navbar-links${menuOpen ? ' open' : ''}`}>
        <NavLink to="/books" className={linkClass}>Books</NavLink>
        {user && (
          <>
            <NavLink to="/borrows" className={linkClass}>My Borrows</NavLink>
            <NavLink to="/requests" className={linkClass}>📬 Requests</NavLink>
            <NavLink to="/messages" className={linkClass}>💬 Messages</NavLink>
          </>
        )}
        {user?.role === 'admin' && (
          <NavLink to="/members" className={linkClass}>Members</NavLink>
        )}
        {user ? (
          <>
            <NavLink to="/profile" className={linkClass} title="My Profile">
              <Avatar name={user.username} size={28} />
              <span style={{ marginLeft: '0.4rem' }}>{user.username}</span>
            </NavLink>
            <button className="btn-secondary" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={linkClass}>Login</NavLink>
            <NavLink to="/register" className={linkClass}>Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
