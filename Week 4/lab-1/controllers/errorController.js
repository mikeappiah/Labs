const AppError = require('../utils/AppError');

const errorController = (err, req, res, next) => {
  // console.log(err.stack);
  console.log(err);
  err.errorCode = err.errorCode || 'error';
  err.statusCode = err.statusCode || 500;

  if (err.code === '23505')
    res.status(err.statusCode).json({
      message: 'Duplicate field value. Please use another value',
    });
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      errorCode: err.errCode,
      message: err.message,
    });
  }
};

module.exports = errorController;
