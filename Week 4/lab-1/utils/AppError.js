class AppError extends Error {
  constructor(errCode, message, statusCode) {
    super(message);
    this.errCode = errCode;
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
