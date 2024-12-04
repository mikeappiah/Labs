const express = require('express');
const transactionController = require('../../controllers/transactionController');
const authController = require('../../controllers/authController');
const viewController = require('../../controllers/viewController');

const router = express.Router();

router.use(authController.isAuthenticated);
router.get('/', transactionController.getBorrowedBooks);
router.get('/all', viewController.renderTransactionsPage);
router.post('/borrow', transactionController.borrowBook);
router.post('/return', transactionController.returnBook);

module.exports = router;
