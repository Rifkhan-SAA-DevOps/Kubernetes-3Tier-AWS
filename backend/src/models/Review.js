const { pool } = require('../config/db');

const SELECT_FIELDS = `
  id,
  book_id AS bookId,
  user_id AS userId,
  username,
  rating,
  comment,
  created_at AS createdAt
`;

const Review = {
  async findByBook(bookId) {
    const [rows] = await pool.query(
      `SELECT ${SELECT_FIELDS} FROM reviews WHERE book_id = ? ORDER BY created_at DESC`,
      [bookId]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT ${SELECT_FIELDS} FROM reviews WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  async create({ bookId, userId, username, rating, comment }) {
    const [result] = await pool.query(
      'INSERT INTO reviews (book_id, user_id, username, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [bookId, userId, username, rating, comment || null]
    );
    return this.findById(result.insertId);
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Review;
