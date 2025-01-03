import AppError from '../utils/AppError.mjs';
import logger from '../utils/logger.mjs';

/* Handle specific type of errors */
export const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}:${error.value}`;
  return new AppError(message, 400);
};

export const handleDuplicateFieldsDB = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  const message = `Duplicate field value:${value}. Please use another value`;
  return new AppError(message, 400);
};

export const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

export const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

export const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.', 401);

/* Development error response */
export const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/* Production error response */
export const sendProdError = (error, res) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    logger.error(`Error: ${error.message}`);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

/* Main error-handling middleware */
const errorController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);

    /* Handle specific error types */
    if (error.name === 'CastError') error = handleCastErrorDB(error);

    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError();

    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendProdError(error, res);
  }
};

export default errorController;
