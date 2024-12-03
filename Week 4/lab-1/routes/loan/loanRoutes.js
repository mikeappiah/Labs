const express = require('express');
// const {
//   renderLoansPage,
//   borrowBook,
//   returnBook,
// } = require('../controllers/loanController');

const router = express.Router();
const authController = require('../../controllers/authController');

// router.get('/', authController.isAuthenticated, renderLoansPage);
// router.post('/borrow', authController.isAuthenticated, borrowBook);
// router.post('/return', authController.isAuthenticated, returnBook);

module.exports = router;
