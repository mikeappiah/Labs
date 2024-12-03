const pool = require('../config/db');

class User {
  static async createUser(name, email, password, role = 'user') {
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      [name, email, password, role],
    );
  }
  static async getUserByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    return rows[0];
  }
}

module.exports = User;
