const pool = require('../config/db');

class Book {
  /* Method to get all books from the database */
  static async getAllBooks() {
    const { rows } = await pool.query('SELECT * FROM books');
    return rows;
  }
  /* Method to get a book by its id from the database */
  static async getBook(id) {
    const { rows } = await pool.query('SELECT * FROM books WHERE id = $1', [
      id,
    ]);
    return rows[0];
  }
  /* Method to add a book to the database */
  static async addBook(title, author, isbn, copies) {
    await pool.query(
      'INSERT INTO books (title, author, isbn, copies) VALUES ($1, $2, $3, $4)',
      [title, author, isbn, copies],
    );
  }

  /* Method to edit a book in the database */
  static async editBook(bookId, update) {
    const fields = Object.keys(update);

    const setClause = fields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(', ');

    const values = Object.values(update);

    // Add the book ID as the last parameter
    values.push(bookId);

    const query = `UPDATE books SET ${setClause} WHERE id = $${fields.length + 1}`;

    await pool.query(query, values);
  }
  /* Method to delete a book from the database */
  static async deleteBook(id) {
    await pool.query('DELETE FROM books WHERE id = $1', [id]);
  }
}

module.exports = Book;
