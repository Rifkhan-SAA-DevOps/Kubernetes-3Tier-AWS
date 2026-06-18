import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const POLL_INTERVAL = 5000;

export default function Messages() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  /* ---------- shared state ---------- */
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  /* ---------- member state ---------- */
  const [thread, setThread] = useState([]);
  const bottomRef = useRef(null);

  /* ---------- admin state ---------- */
  const [conversations, setConversations] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null);
  const [activeUsername, setActiveUsername] = useState('');
  const [adminThread, setAdminThread] = useState([]);

  /* ---------- data fetchers ---------- */
  const fetchThread = useCallback(async () => {
    try {
      const res = await api.get('/messages/mine');
      setThread(res.data);
    } catch { /* ignore */ }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch { /* ignore */ }
  }, []);

  const fetchAdminThread = useCallback(async (uid) => {
    if (!uid) return;
    try {
      const res = await api.get(`/messages/thread/${uid}`);
      setAdminThread(res.data);
    } catch { /* ignore */ }
  }, []);

  /* ---------- polling ---------- */
  useEffect(() => {
    if (isAdmin) {
      fetchConversations();
      const t = setInterval(fetchConversations, POLL_INTERVAL);
      return () => clearInterval(t);
    } else {
      fetchThread();
      const t = setInterval(fetchThread, POLL_INTERVAL);
      return () => clearInterval(t);
    }
  }, [isAdmin, fetchThread, fetchConversations]);

  useEffect(() => {
    if (isAdmin && activeUserId) {
      fetchAdminThread(activeUserId);
      const t = setInterval(() => fetchAdminThread(activeUserId), POLL_INTERVAL);
      return () => clearInterval(t);
    }
  }, [isAdmin, activeUserId, fetchAdminThread]);

  /* scroll to bottom when thread updates */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread, adminThread]);

  /* ---------- send ---------- */
  async function handleSend(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      const payload = { body: body.trim() };
      if (isAdmin) {
        payload.toUserId = activeUserId;
        payload.toUsername = activeUsername;
      }
      await api.post('/messages', payload);
      setBody('');
      if (isAdmin) fetchAdminThread(activeUserId);
      else fetchThread();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not send message');
    } finally {
      setSending(false);
    }
  }

  function selectConversation(uid, uname) {
    setActiveUserId(uid);
    setActiveUsername(uname);
    setAdminThread([]);
    fetchAdminThread(uid);
  }

  /* ---------- render helpers ---------- */
  function formatTime(ts) {
    return ts
      ? new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '';
  }

  function ChatBubble({ msg }) {
    const mine = msg.senderId === user.id || msg.senderId === String(user.id);
    return (
      <div className={`chat-bubble${mine ? ' mine' : ''}`}>
        <p>{msg.body}</p>
        <time>{formatTime(msg.createdAt)}</time>
      </div>
    );
  }

  function ChatForm({ disabled }) {
    return (
      <form className="chat-form" onSubmit={handleSend}>
        <textarea
          rows={2}
          placeholder={disabled ? 'Select a conversation first…' : 'Type a message…'}
          value={body}
          disabled={disabled}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
          }}
        />
        <button type="submit" disabled={disabled || sending || !body.trim()}>
          {sending ? '…' : '📨 Send'}
        </button>
      </form>
    );
  }

  /* ---------- member view ---------- */
  if (!isAdmin) {
    return (
      <div className="container">
        <h1>💬 Messages</h1>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
            <strong>Library Staff</strong>
            <span className="text-secondary" style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>
              Ask us anything about the library
            </span>
          </div>
          <div className="chat-messages">
            {thread.length === 0 ? (
              <p className="text-secondary" style={{ padding: '1rem' }}>
                No messages yet — say hello!
              </p>
            ) : (
              thread.map((msg) => <ChatBubble key={msg.id} msg={msg} />)
            )}
            <div ref={bottomRef} />
          </div>
          <ChatForm disabled={false} />
        </div>
      </div>
    );
  }

  /* ---------- admin view ---------- */
  return (
    <div className="container">
      <h1>💬 Messages</h1>
      <div className="chat-layout">
        {/* Conversation list */}
        <aside className="conversation-list">
          <p className="text-secondary" style={{ padding: '0.75rem 1rem', margin: 0, fontSize: '0.82rem', borderBottom: '1px solid var(--border)' }}>
            Members ({conversations.length})
          </p>
          {conversations.length === 0 && (
            <p className="text-secondary" style={{ padding: '1rem' }}>No conversations yet.</p>
          )}
          <ul>
            {conversations.map((c) => (
              <li key={c.userId}>
                <button
                  className={activeUserId === c.userId || activeUserId === String(c.userId) ? 'active' : ''}
                  onClick={() => selectConversation(c.userId, c.username)}
                >
                  <strong>{c.username}</strong>
                  {c.unreadCount > 0 && (
                    <span className="badge badge-danger" style={{ marginLeft: 'auto', minWidth: '1.4rem', textAlign: 'center' }}>
                      {c.unreadCount}
                    </span>
                  )}
                  <span className="convo-preview">{c.lastMessage}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Chat window */}
        <div className="chat-window">
          {!activeUserId ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <p className="text-secondary">← Select a conversation</p>
            </div>
          ) : (
            <>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
                {activeUsername}
              </div>
              <div className="chat-messages">
                {adminThread.map((msg) => <ChatBubble key={msg.id} msg={msg} />)}
                <div ref={bottomRef} />
              </div>
              <ChatForm disabled={false} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
