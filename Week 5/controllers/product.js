const Product = require('../model/product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return products;
  } catch (error) {
    console.log(error.message);
  }
};

exports.findProduct = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.trim() === '') {
      return res.status(200).render('search-product', {
        products: [],
        error: 'Please enter a search query.',
      });
    }
    const products = await Product.find({
      name: { $regex: name, $options: 'i' },
    });
    console.log(products);
    res.render('search-product', { products, error: null });
  } catch (err) {
    res.status(500).render('search-product', {
      products: [],
      error: 'An error occurred while searching for books.',
    });
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
    if (req.file) {
      req.body.photo = `/uploads/${req.file.filename}`;
    }
    await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.redirect('/');
  } catch (error) {
    console.log(error.message);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (error) {
    console.log(error.message);
  }
};

exports.groupProductsIntoCategories = async () => {
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
  }
};
