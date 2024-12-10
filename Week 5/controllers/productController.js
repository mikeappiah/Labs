const Product = require('../model/productModel');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return products;
  } catch (error) {
    console.log(error);
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createProduct = async (req, res) => {
  try {
    if (req.file) {
      req.body.photo = `/uploads/${req.file.filename}`;
    }
    await Product.create(req.body);

    res.redirect('/shop');
  } catch (error) {
    if (error.code === 11000) {
      const message = `Duplicate field value: ${error.keyValue.name} . Please use another value`;
      return res.render('add-product', { error: message });
    }
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    res.status(200).json({
      status: 'success',
      data: updatedProduct,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getProductsByCategory = async () => {
  try {
    const products = await Product.find({}).lean();

    const categorizedProducts = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});

    return categorizedProducts;
  } catch (error) {
    console.error(error.message);
    return {};
  }
};
