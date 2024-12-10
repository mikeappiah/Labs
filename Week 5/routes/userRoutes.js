const express = require('express');
const authController = require('../controllers/authController');
const viewController = require('../controllers/viewController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/signup', viewController.renderSignupPage);
router.get('/login', viewController.renderLoginPage);

module.exports = router;
