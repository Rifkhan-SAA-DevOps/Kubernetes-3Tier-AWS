const { pool } = require('../config/db');

const SELECT_FIELDS = 'id, username, email, role, created_at AS createdAt';

const User = {
  async create({ username, email, passwordHash, role = 'member' }) {
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, role]
    );
    return this.findById(result.insertId);
  },

  async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT ${SELECT_FIELDS} FROM users WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  async findAll() {
    const [rows] = await pool.query(`SELECT ${SELECT_FIELDS} FROM users ORDER BY id DESC`);
    return rows;
  },

  async update(id, { username, email, role }) {
    await pool.query('UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?', [
      username,
      email,
      role,
      id,
    ]);
    return this.findById(id);
  },

  async updateSelf(id, { username, email, passwordHash }) {
    if (passwordHash) {
      await pool.query(
        'UPDATE users SET username = ?, email = ?, password_hash = ? WHERE id = ?',
        [username, email, passwordHash, id]
      );
    } else {
      await pool.query('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, id]);
    }
    return this.findById(id);
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = User;
