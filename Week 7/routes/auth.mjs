import express from 'express';
import {
  forgotPassword,
  login,
  resetPassword,
  signup,
} from '../controllers/auth.mjs';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/password-reset/:token', resetPassword);

export default router;
