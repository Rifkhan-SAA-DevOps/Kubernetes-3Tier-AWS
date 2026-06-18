const { pool } = require('../config/db');

const ActivityLog = {
  async create({ userId, username, action, details }) {
    await pool.query(
      'INSERT INTO activity_logs (user_id, username, action, details) VALUES (?, ?, ?, ?)',
      [userId || null, username || 'anonymous', action, JSON.stringify(details || {})]
    );
  },

  async findRecent(limit = 50) {
    const [rows] = await pool.query(
      `SELECT id, user_id AS userId, username, action, details, created_at AS createdAt
       FROM activity_logs ORDER BY id DESC LIMIT ?`,
      [limit]
    );
    return rows.map((r) => ({
      ...r,
      details: typeof r.details === 'string' ? JSON.parse(r.details) : r.details,
    }));
  },
};

module.exports = ActivityLog;
