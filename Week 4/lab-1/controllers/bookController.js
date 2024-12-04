const { validationResult, matchedData } = require('express-validator');
const Book = require('../model/bookModel');
const tryCatch = require('../utils/tryCatch');
const AppError = require('../utils/AppError');

/* API CONTROLLERS */
exports.getAllBooks = tryCatch(async (req, res, next) => {
  const books = await Book.getAllBooks();

  res.status(200).json({
    status: 'success',
    results: books.length,
    data: {
      data: books,
    },
  });
});

exports.getBook = tryCatch(async (req, res, next) => {
  const id = +req.params.id;
  const book = await Book.getBook(id);

  if (!book) throw new AppError('error', 'Book with that id not found', 404);

  res.status(200).json({
    status: 'success',
    data: {
      data: book,
    },
  });
});

exports.createBook = tryCatch(async (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const message = result.array();

    const errors = message.map((error) => error.msg).join('. ');

    throw new AppError('ValidationError', errors, 500);
  }
  const { title, author, isbn, copies } = matchedData(req);

  await Book.addBook(title, author, isbn, copies);

  return (
    req.session.user.role === 'librarian' &&
    res.redirect('/librarian/dashboard')
  );
});
exports.updateBook = tryCatch(async (req, res, next) => {
  const id = +req.params.id;
  const bookDetails = {};

  if (req.body.title) bookDetails.title = req.body.title;
  if (req.body.author) bookDetails.author = req.body.author;
  if (req.body.isbn) bookDetails.isbn = req.body.isbn;
  if (req.body.copies) bookDetails.copies = req.body.copies;

  await Book.editBook(id, bookDetails);

  res.redirect('/librarian/dashboard');
});
exports.deleteBook = tryCatch(async (req, res, next) => {
  const id = +req.params.id;

  await Book.deleteBook(id);

  res.redirect('/librarian/dashboard');

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
