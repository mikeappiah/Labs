const express = require('express');
const authController = require('../../controllers/authController');
const bookController = require('../../controllers/bookController');
const viewController = require('../../controllers/viewController');
const router = express.Router();

// Apply librarian middleware to all routes
router.use(authController.isAuthenticated);
router.use(authController.isLibrarian);

router.get('/dashboard', viewController.renderLibrarianDashboard);
router.get('/reports', viewController.renderReportPage);
router.get('/books/add', viewController.renderAddBookPage);
router.get('/books/edit/:id', viewController.renderEditBookPage);

module.exports = router;
