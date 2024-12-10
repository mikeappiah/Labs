const express = require('express');
const upload = require('../config/multerConfig');
const authController = require('../controllers/auth');
const productController = require('../controllers/product');
const viewController = require('../controllers/view');

const router = express.Router();

router.get('/add', viewController.renderAddProductPage);
router.get('/edit/:id', viewController.renderEditProductPage);
router.get('/search', authController.protect, productController.findProduct);
router.get(
  '/:category',
  authController.protect,
  viewController.renderProductsByCategoryPage,
);

router
  .route('/')
  .get(productController.getAllProducts)
  .post(upload.single('image'), productController.createProduct);

router
  .route('/:id')
  .patch(upload.single('image'), productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
