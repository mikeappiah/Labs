const express = require('express');
const upload = require('../utils/multerConfig');
const productController = require('../controllers/productController');
const viewController = require('../controllers/viewController');

const router = express.Router();

router.get('/add', viewController.renderAddProductPage);

router
  .route('/')
  .get(productController.getAllProducts)
  .post(upload.single('image'), productController.createProduct);

router
  .route('/:id')
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
