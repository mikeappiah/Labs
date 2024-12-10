const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const expressSession = require('express-session');
const methodOverride = require('method-override');

const productRouter = require('./routes/product');
const userRouter = require('./routes/user');

const authController = require('./controllers/auth');
const viewController = require('./controllers/view');
const errorController = require('./controllers/error');

(async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('Database connection successful');
  } catch (error) {
    console.log('Database connection error', error);
  }
})();

const app = express();

app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    cookie: {
      secure: process.env.NODE_ENV === 'production' ? true : false,
      maxAge: 3600000,
    },
  }),
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', authController.protect, viewController.renderHomePage);
app.get('/shop', authController.protect, viewController.renderShopPage);
app.use('/products', productRouter);
app.use('/auth', userRouter);

app.use(errorController);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
