const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const expressSession = require('express-session');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const authController = require('./controllers/authController');
const viewController = require('./controllers/viewController');

(async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('Database connection successful');
  } catch (error) {
    console.log('Database connection error', error);
  }
})();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    cookie: { secure: process.env.NODE_ENV === 'production' ? true : false },
  }),
);
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  console.log(req.user);
  next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', authController.protect, viewController.renderHomePage);
app.get('/shop', authController.protect, viewController.renderShopPage);
app.use('/products', productRouter);
app.use('/auth', userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
