const pool = require('../config/db');

class Report {
  static async getReportData() {
    const totalBooksQuery = `SELECT COUNT(*) AS total_books FROM books`;

    const totalBorrowedQuery = `
    SELECT COUNT(*) AS total_borrowed 
    FROM transactions 
    WHERE status = 'borrowed'
  `;
    const overdueBooksQuery = `
    SELECT COUNT(*) AS overdue_books 
    FROM transactions 
    WHERE status = 'borrowed' 
      AND transaction_date < NOW() - INTERVAL '14 days'
  `;
    const userActivityQuery = `
    SELECT users.name, COUNT(transactions.id) AS borrowed_books 
    FROM users 
    LEFT JOIN transactions ON users.id = transactions.user_id 
    GROUP BY users.id, users.name
  `;

    const totalBooks = (await pool.query(totalBooksQuery)).rows[0].total_books;

    const totalBorrowed = (await pool.query(totalBorrowedQuery)).rows[0]
      .total_borrowed;

    const overdueBooks = (await pool.query(overdueBooksQuery)).rows[0]
      .overdue_books;

    const userActivities = (await pool.query(userActivityQuery)).rows;

    return { totalBooks, totalBorrowed, overdueBooks, userActivities };
  }
}

module.exports = Report;
