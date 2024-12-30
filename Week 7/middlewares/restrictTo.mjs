import AppError from '../utils/AppError.mjs';

const restrictTo = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return next(
      new AppError('You do not have permission to perform this action', 403),
    );
  }

  next();
};

export default restrictTo;
