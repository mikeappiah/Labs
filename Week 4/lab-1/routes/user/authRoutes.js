const express = require('express');
const { checkSchema } = require('express-validator');
const authController = require('../../controllers/authController');
const validationSchema = require('../../utils/validationSchema');

const router = express.Router();

router.post(
  '/signup',
  checkSchema(validationSchema.createUserValidationSchema),
  authController.signup,
);

router.post('/login', authController.login);

router.get('/logout', authController.logoutUser);

module.exports = router;
