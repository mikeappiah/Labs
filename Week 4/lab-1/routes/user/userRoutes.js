const express = require('express');
const viewController = require('../../controllers/viewController');
const router = express.Router();

// user dashboard
router.get('/dashboard', viewController.renderUserDashboard);

module.exports = router;
