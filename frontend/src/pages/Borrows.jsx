import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const STATUS_BADGE = {
  borrowed: 'badge-info',
  returned: 'badge-success',
  overdue: 'badge-danger',
};

export default function Borrows() {
  const [borrows, setBorrows] = useState([]);

  async function load() {
    const { data } = await api.get('/borrow/my');
    setBorrows(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleReturn(id) {
    await api.post(`/borrow/${id}/return`);
    load();
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2>My Borrows</h2>
          <p className="page-subtitle">Track your borrowed books, due dates, and fines</p>
        </div>
      </div>

      {borrows.length === 0 ? (
        <div className="empty-state">You haven't borrowed any books yet.</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Book</th><th>Borrowed</th><th>Due</th><th>Returned</th><th>Status</th><th>Fine</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {borrows.map((b) => (
                <tr key={b.id}>
                  <td>{b.bookTitle}</td>
                  <td>{new Date(b.borrowDate).toLocaleDateString()}</td>
                  <td>{new Date(b.dueDate).toLocaleDateString()}</td>
                  <td>{b.returnDate ? new Date(b.returnDate).toLocaleDateString() : '—'}</td>
                  <td><span className={`badge ${STATUS_BADGE[b.status] || 'badge-neutral'}`}>{b.status}</span></td>
                  <td>{b.fineAmount > 0 ? `$${Number(b.fineAmount).toFixed(2)}` : '—'}</td>
                  <td>
                    {b.status === 'borrowed' && <button onClick={() => handleReturn(b.id)}>Return</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
