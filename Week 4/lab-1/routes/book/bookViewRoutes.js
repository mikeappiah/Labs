const express = require('express');
const bookController = require('../../controllers/bookController');

const router = express.Router();

router.get('/', bookController.renderBooksPage);
router.get('/add', bookController.renderAddBookPage);

module.exports = router;
