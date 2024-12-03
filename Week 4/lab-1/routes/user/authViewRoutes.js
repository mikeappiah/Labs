const express = require('express');
const authController = require('../../controllers/authController');

const router = express.Router();

router.get('/signup', authController.renderSignupPage);

router.get('/login', authController.renderLoginPage);

router.get('/logout', authController.logoutUser);

module.exports = router;
