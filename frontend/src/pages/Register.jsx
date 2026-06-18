import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await register(username, email, password);
      navigate('/books');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="auth-wrap">
      <div className="container narrow">
        <div className="auth-card">
          <h2>Create an account</h2>
          <p className="auth-subtitle">Join to borrow books and leave reviews</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />

            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <button type="submit" style={{ marginTop: '1rem' }}>Register</button>
          </form>
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
