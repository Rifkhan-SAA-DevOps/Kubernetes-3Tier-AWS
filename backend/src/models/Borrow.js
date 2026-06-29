const { pool } = require('../config/db');

const SELECT_FIELDS = `
  b.id,
  b.book_id AS bookId,
  b.user_id AS userId,
  bk.title AS bookTitle,
  bk.author AS author,
  u.username AS username,
  b.borrow_date AS borrowDate,
  b.due_date AS dueDate,
  b.return_date AS returnDate,
  b.status,
  b.fine_amount AS fineAmount
`;

const Borrow = {
  async create({ bookId, userId, dueDate }) {
    const [result] = await pool.query(
      'INSERT INTO borrows (book_id, user_id, due_date) VALUES (?, ?, ?)',
      [bookId, userId, dueDate]
    );
    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT ${SELECT_FIELDS} FROM borrows b
       JOIN books bk ON bk.id = b.book_id
       JOIN users u ON u.id = b.user_id
       WHERE b.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findAll() {
    const [rows] = await pool.query(
      `SELECT ${SELECT_FIELDS} FROM borrows b
       JOIN books bk ON bk.id = b.book_id
       JOIN users u ON u.id = b.user_id
       ORDER BY b.id DESC`
    );
    return rows;
  },

  async findByUser(userId) {
    const [rows] = await pool.query(
      `SELECT ${SELECT_FIELDS} FROM borrows b
       JOIN books bk ON bk.id = b.book_id
       JOIN users u ON u.id = b.user_id
       WHERE b.user_id = ?
       ORDER BY b.id DESC`,
      [userId]
    );
    return rows;
  },

  async markReturned(id, fineAmount = 0) {
    await pool.query(
      "UPDATE borrows SET status = 'returned', return_date = CURRENT_DATE, fine_amount = ? WHERE id = ?",
      [fineAmount, id]
    );
    return this.findById(id);
  },

  async hasActiveBorrow(bookId, userId) {
    const [rows] = await pool.query(
      "SELECT id FROM borrows WHERE book_id = ? AND user_id = ? AND status = 'borrowed'",
      [bookId, userId]
    );
    return rows.length > 0;
  },
};

module.exports = Borrow;
