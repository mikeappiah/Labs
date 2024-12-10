const Product = require('../model/product');
const productController = require('./product');

exports.renderHomePage = (req, res) => {
  res.status(200).render('home');
};

exports.renderShopPage = async (req, res) => {
  const categorizedProducts =
    await productController.groupProductsIntoCategories();
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

exports.renderAddProductPage = (req, res) => {
  res.status(200).render('add-product', { error: null });
};

exports.renderEditProductPage = async (req, res) => {
  const product = await Product.findById(req.params.id);

  res.status(200).render('edit-product', { product, error: null });
};
exports.renderProductsByCategoryPage = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });

    res.status(200).render('categories', {
      products,
      category,
      error: null,
    });
  } catch (error) {
    res.status(200).render('categories', {
      error: 'Failed to fetch products',
    });
  }
};

exports.renderSearchProductPage = async (req, res) => {
  res.status(200).render('search-product');
};
