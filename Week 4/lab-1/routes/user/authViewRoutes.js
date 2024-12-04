const express = require('express');
const viewController = require('../../controllers/viewController');

const router = express.Router();

router.get('/signup', viewController.renderSignupPage);

router.get('/login', viewController.renderLoginPage);

module.exports = router;
