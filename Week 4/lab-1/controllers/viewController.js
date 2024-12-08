const Book = require('../model/bookModel');
const Transaction = require('../model/transactionModel');
const Report = require('../model/reportModel');
const tryCatch = require('../utils/tryCatch');

exports.renderSignupPage = (req, res) =>
  res.render('auth/signup', { error: null, layout: false });

exports.renderLoginPage = (req, res) =>
  res.render('auth/login', { error: null, layout: false });

exports.renderLibrarianDashboard = tryCatch(async (req, res) => {
  const books = await Book.getAllBooks();

  res.render('librarian/dashboard', { books, user: req.session.user });
});

exports.renderUserDashboard = tryCatch(async (req, res) => {
  const books = await Book.getAllBooks();
  res.render('user/dashboard', {
    books,
    user: req.session.user,
  });
});

exports.renderAddBookPage = (req, res) => {
  res.render('librarian/add-book');
};

exports.renderEditBookPage = tryCatch(async (req, res) => {
  const book = await Book.getBook(req.params.id);
  res.render('librarian/edit-book', { book });
});

exports.renderTransactionsPage = tryCatch(async (req, res) => {
  const { user } = req.session;

  const transactions =
    user.role === 'librarian'
      ? await Transaction.getAll()
      : await Transaction.getUserTransactions(user.id);

  res.render('transactions/all', { transactions, user, error: null });
});

exports.renderReportPage = tryCatch(async (req, res) => {
  const reportData = await Report.getReportData();
  res.render('reports/index', { reportData, error: null });
});
