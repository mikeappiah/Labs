const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product name is required'],
    unique: true,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'A product price is required'],
    min: 0,
  },
  photo: {
    type: String,
  },
  category: {
    type: String,
    required: true,
    enum: {
      values: [
        'electronics',
        'fashion',
        'food and beverages',
        'books and media',
        'toys and games',
        'automotive',
      ],
      message: 'The product categrory you entered does not exist',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
