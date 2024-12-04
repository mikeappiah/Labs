const bcrypt = require('bcrypt');
const { validationResult, matchedData } = require('express-validator');
const tryCatch = require('../utils/tryCatch');
const User = require('../model/userModel');
const AppError = require('../utils/AppError');

/* API ROUTES */
exports.signup = tryCatch(async (req, res) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const message = result.array();

    const errors = message.map((error) => error.msg).join('. ');
    res.render('auth/signup', { error: errors });
  }

  const { name, email, password, role } = matchedData(req);

  const existingUser = await User.getUserByEmail(email);

  if (existingUser) {
    res.render('auth/signup', { error: 'User already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.createUser(name, email, hashedPassword, role);

  res.redirect('/auth/login');
});

exports.login = tryCatch(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('auth/login', {
      error: 'Please provide email and password',
    });
  }
  const user = await User.getUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render('auth/login', { error: 'Incorrect email or password' });
  }
  req.session.user = user;

  if (user.role === 'librarian') {
    return res.redirect('/librarian/dashboard');
  } else {
    return res.redirect('/user/dashboard');
  }
});

exports.logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};

/* PROTECTION MIDDLEWARE */
exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/auth/login');
};

exports.isLibrarian = (req, res, next) => {
  if (req.session.user.role === 'librarian') return next();
  res.status(403).send('Access denied');
};
