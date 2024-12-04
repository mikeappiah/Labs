const pool = require('../config/db');

class Transaction {
  static async getAll() {
    const { rows } = await pool.query(
      `SELECT transactions.id, users.name AS user_name, books.title AS book_title, 
            transactions.transaction_date, transactions.return_date, transactions.status
     FROM transactions
     JOIN users ON transactions.user_id = users.id
     JOIN books ON transactions.book_id = books.id`,
    );
    return rows;
  }

  static async addOne(user_id, book_id) {
    await pool.query(
      `INSERT INTO transactions (user_id, book_id, status) VALUES ($1, $2, 'borrowed')`,
      [user_id, book_id],
    );
    await pool.query(
      `UPDATE books SET copies = copies - 1 WHERE id = $1 AND copies > 0`,
      [book_id],
    );
  }

  static async returnOne(loan_id) {
    await pool.query(
      `UPDATE transactions SET status = 'returned', return_date = CURRENT_DATE WHERE id = $1`,
      [loan_id],
    );
    await pool.query(
      `UPDATE books SET copies = copies + 1 WHERE id = 
     (SELECT book_id FROM transactions WHERE id = $1)`,
      [loan_id],
    );
  }
  static async getUserTransactions(user_id) {
    const { rows } = await pool.query(
      `SELECT transactions.id, books.title AS book_title, users.name AS user_name, 
            transactions.transaction_date, transactions.return_date, transactions.status
     FROM transactions
     JOIN books ON transactions.book_id = books.id
     JOIN users ON transactions.user_id = users.id
     WHERE transactions.user_id = $1`,
      [user_id],
    );
    return rows;
  }
}

module.exports = Transaction;
