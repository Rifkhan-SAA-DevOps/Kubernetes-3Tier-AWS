import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="hero">
        <h2>Welcome to the Library Management System</h2>
        {user ? (
          <p>Logged in as <strong>{user.username}</strong> ({user.role}).</p>
        ) : (
          <p>Browse the catalog, and log in to borrow books and leave reviews.</p>
        )}
      </div>

      <div className="card-grid">
        <Link className="card" to="/books">
          <span className="card-icon">📖</span>
          Browse Books
        </Link>
        {user && (
          <Link className="card" to="/borrows">
            <span className="card-icon">🔄</span>
            My Borrows
          </Link>
        )}
        {user?.role === 'admin' && (
          <Link className="card" to="/members">
            <span className="card-icon">👥</span>
            Manage Members
          </Link>
        )}
        {!user && (
          <Link className="card" to="/register">
            <span className="card-icon">✨</span>
            Create an Account
          </Link>
        )}
      </div>
    </div>
  );
}
