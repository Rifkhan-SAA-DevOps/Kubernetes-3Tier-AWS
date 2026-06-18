import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const STATUS_COLORS = { pending: 'warning', approved: 'success', rejected: 'danger' };

const emptyForm = { title: '', author: '', notes: '' };

export default function Requests() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  async function load() {
    try {
      const url = isAdmin ? '/book-requests' : '/book-requests/mine';
      const res = await api.get(url);
      setRequests(res.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Book title is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setMessage('');
    try {
      await api.post('/book-requests', { title: form.title.trim(), author: form.author.trim(), notes: form.notes.trim() });
      setMessage('✅ Request submitted! The librarians will review it.');
      setForm(emptyForm);
      load();
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Could not submit request'}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatus(id, status) {
    try {
      await api.put(`/book-requests/${id}`, { status });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update status');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this request?')) return;
    try {
      await api.delete(`/book-requests/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete request');
    }
  }

  return (
    <div className="container">
      <h1>Book Requests</h1>

      {/* Submit form — members only */}
      {!isAdmin && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2>📬 Request a Book</h2>
          <p className="text-secondary" style={{ marginBottom: '1rem' }}>
            Can't find a book in our catalog? Let us know and we'll try to add it!
          </p>
          {message && <div className="alert alert-info">{message}</div>}
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="field-group">
              <label htmlFor="req-title">Book Title *</label>
              <input
                id="req-title"
                type="text"
                placeholder="e.g. The Great Gatsby"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                className={errors.title ? 'invalid' : ''}
              />
              {errors.title && <p className="field-error">{errors.title}</p>}
            </div>
            <div className="field-group">
              <label htmlFor="req-author">Author (optional)</label>
              <input
                id="req-author"
                type="text"
                placeholder="e.g. F. Scott Fitzgerald"
                value={form.author}
                onChange={(e) => setField('author', e.target.value)}
              />
            </div>
            <div className="field-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="req-notes">Additional Notes (optional)</label>
              <textarea
                id="req-notes"
                rows={3}
                placeholder="Any extra details — ISBN, edition, why you need it…"
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Submitting…' : '📬 Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Request list */}
      <div className="card">
        <h2>{isAdmin ? 'All Book Requests' : 'My Requests'}</h2>
        {loading ? (
          <p>Loading…</p>
        ) : requests.length === 0 ? (
          <p className="text-secondary">No requests yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  {isAdmin && <th>Member</th>}
                  <th>Title</th>
                  <th>Author</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    {isAdmin && <td>{r.username}</td>}
                    <td><strong>{r.title}</strong></td>
                    <td>{r.author || '—'}</td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {r.notes || '—'}
                    </td>
                    <td>
                      <span className={`badge badge-${STATUS_COLORS[r.status] || 'neutral'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {isAdmin && r.status === 'pending' && (
                          <>
                            <button
                              className="icon-btn icon-btn-primary"
                              title="Approve"
                              onClick={() => handleStatus(r.id, 'approved')}
                            >
                              ✅
                            </button>
                            <button
                              className="icon-btn icon-btn-danger"
                              title="Reject"
                              onClick={() => handleStatus(r.id, 'rejected')}
                            >
                              ❌
                            </button>
                          </>
                        )}
                        {(isAdmin || r.status === 'pending') && (
                          <button
                            className="icon-btn icon-btn-danger"
                            title="Delete"
                            onClick={() => handleDelete(r.id)}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
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
