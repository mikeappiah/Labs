const express = require('express');
const bookController = require('../../controllers/bookController');
const authController = require('../../controllers/authController');
const viewController = require('../../controllers/viewController');
const router = express.Router();

// user dashboard
router.get('/dashboard', viewController.renderUserDashboard);

// Search for books
router.get(
  '/search',
  authController.isAuthenticated,
  bookController.searchForBooks,
);

module.exports = router;
