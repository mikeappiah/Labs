const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createToken = (user) => {
  const payload = {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  };

  const token = signToken(payload);
  return token;
};

exports.signup = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).render('signup', {
        error: 'User with that email already exists',
      });
    }

    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const token = createToken(newUser);

    req.session.token = token;

    res.redirect('/auth/login');
  } catch (error) {
    console.log(error.message);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render('auth/login', {
        error: 'Please provide email and password!',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(400).render('auth/login', {
        error: 'Incorrect email or password',
      });
    }

    const token = createToken(user);

    req.session.token = token;

    res.redirect('/');
  } catch (error) {
    console.log(error.message);
  }
};

exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect('/auth/login');
  });
};

exports.protect = (req, res, next) => {
  const token = req.session.token;

  if (!token)
    return res.status(401).render('auth/login', {
      error: 'Please log in to access this page',
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    console.log(req.user);

    next();
  } catch (error) {
    console.log(error);
    req.session.destroy();
    return res.status(401).render('auth/login', {
      error: 'Session expired. Please log in again.',
    });
  }
};
