import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Avatar from '../components/Avatar';

const STATUS_COLORS = { borrowed: 'warning', returned: 'success', overdue: 'danger' };

export default function Profile() {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({ username: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [borrows, setBorrows] = useState([]);
  const [borrowsLoading, setBorrowsLoading] = useState(true);

  /* populate form once user is available */
  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, username: user.username || '', email: user.email || '' }));
    }
  }, [user]);

  /* load borrow history */
  useEffect(() => {
    async function loadBorrows() {
      try {
        const res = await api.get('/borrow/my');
        setBorrows(res.data);
      } catch { /* ignore */ }
      finally { setBorrowsLoading(false); }
    }
    loadBorrows();
  }, []);

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Enter a valid email';
    if (form.newPassword) {
      if (form.newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters';
      if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
      if (!form.currentPassword) errs.currentPassword = 'Current password is required to change password';
    }
    return errs;
  }

  async function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setProfileMsg('');
    try {
      const payload = { username: form.username.trim(), email: form.email.trim() };
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      const res = await api.put('/auth/me', payload);
      /* update stored token & user */
      localStorage.setItem('lms_token', res.data.token);
      localStorage.setItem('lms_user', JSON.stringify(res.data.user));
      if (setUser) setUser(res.data.user);
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setProfileMsg('✅ Profile updated successfully!');
    } catch (err) {
      setProfileMsg(`❌ ${err.response?.data?.message || 'Could not update profile'}`);
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <div className="container">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '860px' }}>
      <h1>👤 Profile</h1>

      {/* Profile card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Avatar name={user.username} size={56} />
          <div>
            <h2 style={{ margin: 0 }}>{user.username}</h2>
            <span className={`badge badge-${user.role === 'admin' ? 'primary' : 'neutral'}`}>
              {user.role}
            </span>
          </div>
        </div>

        {profileMsg && (
          <div className={`alert ${profileMsg.startsWith('✅') ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '1rem' }}>
            {profileMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="form-grid">
          <div className="field-group">
            <label htmlFor="p-username">Username</label>
            <input
              id="p-username"
              type="text"
              value={form.username}
              onChange={(e) => setField('username', e.target.value)}
              className={errors.username ? 'invalid' : ''}
            />
            {errors.username && <p className="field-error">{errors.username}</p>}
          </div>
          <div className="field-group">
            <label htmlFor="p-email">Email</label>
            <input
              id="p-email"
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              className={errors.email ? 'invalid' : ''}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <p style={{ margin: '0 0 0.75rem', fontWeight: 600 }}>Change Password (optional)</p>
          </div>

          <div className="field-group">
            <label htmlFor="p-cur">Current Password</label>
            <input
              id="p-cur"
              type="password"
              placeholder="Required to change password"
              value={form.currentPassword}
              onChange={(e) => setField('currentPassword', e.target.value)}
              className={errors.currentPassword ? 'invalid' : ''}
            />
            {errors.currentPassword && <p className="field-error">{errors.currentPassword}</p>}
          </div>
          <div className="field-group">
            <label htmlFor="p-new">New Password</label>
            <input
              id="p-new"
              type="password"
              placeholder="Min 6 characters"
              value={form.newPassword}
              onChange={(e) => setField('newPassword', e.target.value)}
              className={errors.newPassword ? 'invalid' : ''}
            />
            {errors.newPassword && <p className="field-error">{errors.newPassword}</p>}
          </div>
          <div className="field-group">
            <label htmlFor="p-confirm">Confirm New Password</label>
            <input
              id="p-confirm"
              type="password"
              placeholder="Repeat new password"
              value={form.confirmPassword}
              onChange={(e) => setField('confirmPassword', e.target.value)}
              className={errors.confirmPassword ? 'invalid' : ''}
            />
            {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Borrow history */}
      <div className="card">
        <h2>📖 Borrow History</h2>
        {borrowsLoading ? (
          <p>Loading…</p>
        ) : borrows.length === 0 ? (
          <p className="text-secondary">You haven't borrowed any books yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Borrowed On</th>
                  <th>Due Date</th>
                  <th>Returned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {borrows.map((b) => (
                  <tr key={b.id}>
                    <td><strong>{b.bookTitle || b.title || '—'}</strong></td>
                    <td>{b.borrowDate ? new Date(b.borrowDate).toLocaleDateString() : '—'}</td>
                    <td>{b.dueDate ? new Date(b.dueDate).toLocaleDateString() : '—'}</td>
                    <td>{b.returnDate ? new Date(b.returnDate).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={`badge badge-${STATUS_COLORS[b.status] || 'neutral'}`}>
                        {b.status || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
