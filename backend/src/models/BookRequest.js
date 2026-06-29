const { pool } = require('../config/db');

const SELECT_FIELDS = `
  id, user_id AS userId, username, title, author, notes, status,
  created_at AS createdAt
`;

const BookRequest = {
  async create({ userId, username, title, author, notes }) {
    const [result] = await pool.query(
      `INSERT INTO book_requests (user_id, username, title, author, notes) VALUES (?, ?, ?, ?, ?)`,
      [userId, username, title, author || null, notes || null]
    );
    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT ${SELECT_FIELDS} FROM book_requests WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  async findByUser(userId) {
    const [rows] = await pool.query(
      `SELECT ${SELECT_FIELDS} FROM book_requests WHERE user_id = ? ORDER BY id DESC`,
      [userId]
    );
    return rows;
  },

  async findAll() {
    const [rows] = await pool.query(`SELECT ${SELECT_FIELDS} FROM book_requests ORDER BY id DESC`);
    return rows;
  },

  async updateStatus(id, status) {
    await pool.query('UPDATE book_requests SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM book_requests WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = BookRequest;
