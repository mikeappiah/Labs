import jwt from 'jsonwebtoken';
import protectRoute from '../../middlewares/protectRoute.mjs';
import User from '../../models/user.mjs';
import AppError from '../../utils/AppError.mjs';

jest.mock('jsonwebtoken');
jest.mock('../../models/user.mjs');
jest.mock('../../utils/AppError.mjs', () => {
  return jest.fn().mockImplementation((message, statusCode) => ({
    message,
    statusCode,
  }));
});

describe('protectRoute Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      headers: {
        authorization: 'Bearer valid_token',
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();

    process.env.JWT_SECRET = 'test_secret';
  });

  test('should proceed when valid token is provided', async () => {
    const mockUser = {
      _id: 'user123',
      changedPasswordAfter: jest.fn().mockReturnValue(false),
    };

    jwt.verify.mockReturnValue({ id: 'user123', iat: Date.now() });
    User.findById.mockResolvedValue(mockUser);

    await protectRoute(mockReq, mockRes, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith('valid_token', 'test_secret');
    expect(User.findById).toHaveBeenCalledWith(mockUser._id);
    expect(mockUser.changedPasswordAfter).toHaveBeenCalled();
    expect(mockReq.user).toBe(mockUser);
    expect(mockNext).toHaveBeenCalledWith();
  });

  test('should return error when no token is provided', async () => {
    mockReq.headers.authorization = undefined;

    await protectRoute(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  });

  test('should return error when user no longer exists', async () => {
    jwt.verify.mockReturnValue({ id: 'user123', iat: Date.now() });
    User.findById.mockResolvedValue(null);

    await protectRoute(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  });

  test('should return error when password was changed after token issuance', async () => {
    const mockUser = {
      _id: 'user123',
      changedPasswordAfter: jest.fn().mockReturnValue(true),
    };

    jwt.verify.mockReturnValue({ id: 'user123', iat: Date.now() });
    User.findById.mockResolvedValue(mockUser);

    await protectRoute(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      new AppError('User recently changed password! Please log in again.', 401),
    );
  });
});
