const pool = require('../config/db');
class Loan {
  static async getAllLoans() {
    const { rows } = await pool.query(
      `SELECT loans.id, users.name AS user_name, books.title AS book_title, 
            loans.loan_date, loans.return_date, loans.status
     FROM loans
     JOIN users ON loans.user_id = users.id
     JOIN books ON loans.book_id = books.id`,
    );
    return rows;
  }

  static async addLoan(user_id, book_id) {
    await pool.query(
      `INSERT INTO loans (user_id, book_id, status) VALUES ($1, $2, 'borrowed')`,
      [user_id, book_id],
    );
    await pool.query(
      `UPDATE books SET copies = copies - 1 WHERE id = $1 AND copies > 0`,
      [book_id],
    );
  }

  static async returnLoan(loan_id) {
    await pool.query(
      `UPDATE loans SET status = 'returned', return_date = CURRENT_DATE WHERE id = $1`,
      [loan_id],
    );
    await pool.query(
      `UPDATE books SET copies = copies + 1 WHERE id = 
     (SELECT book_id FROM loans WHERE id = $1)`,
      [loan_id],
    );
  }
}

module.exports = Loan;
