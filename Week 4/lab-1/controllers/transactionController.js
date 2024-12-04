const Transaction = require('../model/transactionModel');
const tryCatch = require('../utils/tryCatch');

exports.getBorrowedBooks = tryCatch(async (req, res) => {
  const borrowedBooks = await Transaction.getAll();

  res.status(200).json({
    status: 'success',
    results: borrowedBooks.length,
    data: {
      data: borrowedBooks,
    },
  });
});

exports.borrowBook = tryCatch(async (req, res) => {
  const { book_id } = req.body;

  await Transaction.addOne(req.session.user.id, book_id);
  res.redirect('/transactions/all');
});

exports.returnBook = tryCatch(async (req, res) => {
  const { transaction_id } = req.body;
  await Transaction.returnOne(transaction_id);
  res.redirect('/transactions/all');
});
