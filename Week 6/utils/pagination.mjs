import AppError from './AppError.mjs';

const getPagination = (req, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;

  if (page < 1 || limit < 1) {
    return next(new AppError('Invalid page or limit parameter', 400));
  }

  const skip = (page - 1) * limit;

  return { limit, skip };
};

export default getPagination;
