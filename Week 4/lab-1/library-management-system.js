const path = require('path');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./config/db');
const errorController = require('./controllers/errorController');

const bookRouter = require('./routes/book/bookRoutes');
const bookViewRouter = require('./routes/book/bookViewRoutes');

const userRouter = require('./routes/user/userRoutes');
const authViewRouter = require('./routes/user/authViewRoutes');

const loanRouter = require('./routes/loan/loanRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);
app.use(
  session({
    store: new pgSession({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    rolling: true, // Reset cookie expiration on each request
    cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 },
  }),
);

// Middleware to make `user` available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  console.log(req.session.user);
  next();
});

/* view engine setup */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');

/* API */
app.use('/api/books', bookRouter);
app.use('/api/auth', userRouter);

/* VIEWS */
app.use('/books', bookViewRouter);
app.use('/auth', authViewRouter);

// Error handling middleware
app.use(errorController);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
