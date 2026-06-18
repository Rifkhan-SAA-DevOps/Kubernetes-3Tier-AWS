import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Avatar from '../components/Avatar';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [logs, setLogs] = useState([]);

  async function load() {
    const { data } = await api.get('/members');
    setMembers(data);
    try {
      const { data: logData } = await api.get('/logs', { params: { limit: 20 } });
      setLogs(logData);
    } catch {
      setLogs([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeRole(id, role) {
    const member = members.find((m) => m.id === id);
    await api.put(`/members/${id}`, { username: member.username, email: member.email, role });
    load();
  }

  async function remove(id) {
    if (!window.confirm('Remove this member?')) return;
    await api.delete(`/members/${id}`);
    load();
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2>Members</h2>
          <p className="page-subtitle">Manage user roles and view recent activity</p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Username</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Avatar name={m.username} />
                    {m.username}
                  </span>
                </td>
                <td>{m.email}</td>
                <td>
                  <select value={m.role} onChange={(e) => changeRole(m.id, e.target.value)}>
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                <td><button className="btn-danger" onClick={() => remove(m.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginTop: '2rem' }}>Recent Activity</h3>
      {logs.length === 0 ? (
        <div className="empty-state">No recent activity.</div>
      ) : (
        <ul className="activity-list">
          {logs.map((l) => (
            <li key={l.id}>
              <Avatar name={l.username} />
              <strong>{l.username}</strong>
              <span className="activity-action">{l.action}</span>
              <time>{new Date(l.createdAt).toLocaleString()}</time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
