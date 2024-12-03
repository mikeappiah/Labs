const AppError = require('../utils/AppError');

const errorController = (err, req, res, next) => {
  console.log(err);
  err.errorCode = err.errorCode || 'error';
  err.statusCode = err.statusCode || 500;

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      errorCode: err.errCode,
      message: err.message,
    });
  }
};

module.exports = errorController;
