const express = require('express');
const { checkSchema } = require('express-validator');
const bookController = require('../../controllers/bookController');
const validationSchema = require('../../utils/validationSchema');

const router = express.Router();

router
  .route('/')
  .get(bookController.getAllBooks)
  .post(
    checkSchema(validationSchema.createBookValidationSchema),
    bookController.createBook,
  );
router
  .route('/:id')
  .get(bookController.getBook)
  .patch(bookController.updateBook)
  .delete(bookController.deleteBook);

module.exports = router;
