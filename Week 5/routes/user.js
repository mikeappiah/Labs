const express = require('express');
const authController = require('../controllers/auth');
const viewController = require('../controllers/view');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.get('/signup', viewController.renderSignupPage);
router.get('/login', viewController.renderLoginPage);

module.exports = router;
