const { pool } = require('../config/db');

const BASE_QUERY = `
  SELECT
    b.id, b.title, b.author, b.isbn, b.category, b.description,
    b.published_year AS publishedYear,
    b.total_copies AS totalCopies,
    b.available_copies AS availableCopies,
    b.image_url AS imageUrl,
    b.created_at AS createdAt,
    COALESCE(ROUND(r.avgRating, 1), 0) AS avgRating,
    COALESCE(r.reviewCount, 0) AS reviewCount
  FROM books b
  LEFT JOIN (
    SELECT book_id, AVG(rating) AS avgRating, COUNT(*) AS reviewCount
    FROM reviews
    GROUP BY book_id
  ) r ON r.book_id = b.id
`;

function normalizeRow(row) {
  if (!row) return row;
  return {
    ...row,
    avgRating: row.avgRating !== null ? Number(row.avgRating) : 0,
    reviewCount: row.reviewCount !== null ? Number(row.reviewCount) : 0,
  };
}

const Book = {
  async findAll({ search, category } = {}) {
    let sql = `${BASE_QUERY} WHERE 1=1`;
    const params = [];

    if (search) {
      sql += ' AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    if (category) {
      sql += ' AND b.category = ?';
      params.push(category);
    }
    sql += ' ORDER BY b.id DESC';

    const [rows] = await pool.query(sql, params);
    return rows.map(normalizeRow);
  },

  async findById(id) {
    const [rows] = await pool.query(`${BASE_QUERY} WHERE b.id = ?`, [id]);
    return rows[0] ? normalizeRow(rows[0]) : null;
  },

  async create({ title, author, isbn, category, description, publishedYear, totalCopies, imageUrl }) {
    const [result] = await pool.query(
      `INSERT INTO books (title, author, isbn, category, description, published_year, total_copies, available_copies, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, author, isbn || null, category || null, description || null, publishedYear || null, totalCopies, totalCopies, imageUrl || null]
    );
    return this.findById(result.insertId);
  },

  async update(id, { title, author, isbn, category, description, publishedYear, totalCopies, availableCopies, imageUrl }) {
    await pool.query(
      `UPDATE books SET title = ?, author = ?, isbn = ?, category = ?, description = ?,
       published_year = ?, total_copies = ?, available_copies = ?, image_url = ? WHERE id = ?`,
      [title, author, isbn || null, category || null, description || null, publishedYear || null, totalCopies, availableCopies, imageUrl || null, id]
    );
    return this.findById(id);
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM books WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async decrementAvailable(id) {
    await pool.query(
      'UPDATE books SET available_copies = available_copies - 1 WHERE id = ? AND available_copies > 0',
      [id]
    );
  },

  async incrementAvailable(id) {
    await pool.query(
      'UPDATE books SET available_copies = available_copies + 1 WHERE id = ? AND available_copies < total_copies',
      [id]
    );
  },
};

module.exports = Book;
