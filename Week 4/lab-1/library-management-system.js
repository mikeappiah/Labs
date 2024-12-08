const path = require('path');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const methodOverride = require('method-override');
const pgSession = require('connect-pg-simple')(session);

const pool = require('./config/db');

const bookRouter = require('./routes/book/bookRoutes');
const authRouter = require('./routes/user/authRoutes');
const librarianRouter = require('./routes/user/librarianRoutes');
const userRouter = require('./routes/user/userRoutes');
const authViewRouter = require('./routes/user/authViewRoutes');
const transactionRouter = require('./routes/transaction/transactionRoutes');
const errorController = require('./controllers/errorController');

const app = express();

app.use(express.json());
app.use(methodOverride('_method'));
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
    saveUninitialized: false,
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
app.use('/api/auth', authRouter);

/* VIEWS */

app.use('/auth', authViewRouter);
app.use('/librarian', librarianRouter);
app.use('/user', userRouter);
app.use('/transactions', transactionRouter);
app.use('/', (req, res) => {
  res.render('home', { layout: false });
});

// Error handling middleware
app.use(errorController);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
