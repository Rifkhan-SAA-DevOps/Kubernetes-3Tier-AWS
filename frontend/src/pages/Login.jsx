import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/books');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="auth-wrap">
      <div className="container narrow">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Log in to manage your borrows and reviews</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />

            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <button type="submit" style={{ marginTop: '1rem' }}>Login</button>
          </form>
          <p className="hint">
            Default admin: <code>admin / Admin@123</code>
          </p>
          <p>
            No account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
