import AppError from '../../utils/AppError.mjs';
import restrictTo from '../../middlewares/restrictTo.mjs';

jest.mock('../../utils/AppError.mjs', () => {
  return jest.fn().mockImplementation((message, statusCode) => ({
    message,
    statusCode,
  }));
});

describe('restrictTo Middleware', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {
      user: {
        role: 'admin',
      },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should allow access if user has the required role', () => {
    const middleware = restrictTo('admin');
    middleware(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should deny access if user does not have required role', () => {
    const middleware = restrictTo('user');
    middleware(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      new AppError('You do not have permission to perform this action', 403),
    );
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should handle undefined user role', () => {
    mockRequest.user.role = undefined;
    const middleware = restrictTo('admin');
    middleware(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      new AppError('You do not have permission to perform this action', 403),
    );
    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});
