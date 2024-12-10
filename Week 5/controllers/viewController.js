const productController = require('../controllers/productController');

exports.renderHomePage = (req, res) => {
  res.status(200).render('home');
};

exports.renderAddProductPage = (req, res) => {
  res.status(200).render('add-product', { error: null });
};

exports.renderShopPage = async (req, res) => {
  const categorizedProducts = await productController.getProductsByCategory();
  res.status(200).render('shop', {
    categorizedProducts,
  });
};

exports.renderSignupPage = (req, res) => {
  res.status(200).render('auth/signup', { error: null });
};
exports.renderLoginPage = (req, res) => {
  res.status(200).render('auth/login', { error: null });
};
