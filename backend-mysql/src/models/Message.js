const { pool } = require('../config/db');

const SELECT_FIELDS = `
  id,
  sender_id AS senderId,
  sender_username AS senderUsername,
  recipient_id AS recipientId,
  recipient_username AS recipientUsername,
  body,
  is_read AS isRead,
  created_at AS createdAt
`;

const Message = {
  /** Send a message. recipientId/recipientUsername NULL means "to Library Staff". */
  async create({ senderId, senderUsername, recipientId, recipientUsername, body }) {
    const [result] = await pool.query(
      `INSERT INTO messages
         (sender_id, sender_username, recipient_id, recipient_username, body)
       VALUES (?, ?, ?, ?, ?)`,
      [senderId, senderUsername, recipientId || null, recipientUsername || null, body]
    );
    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT ${SELECT_FIELDS} FROM messages WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  /** All messages in a user's thread (sent by them OR addressed to them). */
  async getMyThread(userId) {
    const [rows] = await pool.query(
      `SELECT ${SELECT_FIELDS} FROM messages
       WHERE sender_id = ? OR recipient_id = ?
       ORDER BY created_at ASC`,
      [userId, userId]
    );
    return rows;
  },

  /** Admin: thread with a specific user. */
  async getThreadWith(userId) {
    return this.getMyThread(userId);
  },

  /**
   * Admin: list of unique conversation participants with their latest message and
   * unread count (messages sent by that user that the admin hasn't read yet).
   */
  async listConversations() {
    const [rows] = await pool.query(`
      SELECT
        u.sender_id       AS userId,
        u.sender_username AS username,
        latest.body       AS lastMessage,
        latest.created_at AS lastAt,
        unread.cnt        AS unreadCount
      FROM (
        SELECT DISTINCT sender_id, sender_username
        FROM messages
        WHERE recipient_id IS NULL
      ) u
      JOIN messages latest
        ON latest.id = (
          SELECT id FROM messages
          WHERE sender_id = u.sender_id OR recipient_id = u.sender_id
          ORDER BY created_at DESC LIMIT 1
        )
      LEFT JOIN (
        SELECT sender_id, COUNT(*) AS cnt
        FROM messages
        WHERE recipient_id IS NULL AND is_read = 0
        GROUP BY sender_id
      ) unread ON unread.sender_id = u.sender_id
      ORDER BY latest.created_at DESC
    `);
    return rows;
  },

  async markRead(messageId) {
    await pool.query('UPDATE messages SET is_read = 1 WHERE id = ?', [messageId]);
  },

  /** Mark all unread messages sent by a given user as read (admin reads user's msgs). */
  async markThreadRead(fromUserId) {
    await pool.query('UPDATE messages SET is_read = 1 WHERE sender_id = ? AND is_read = 0', [fromUserId]);
  },
};

module.exports = Message;
