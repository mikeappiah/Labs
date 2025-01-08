import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

import User from '../../models/user.mjs';
import AppError from '../../utils/AppError.mjs';

import {
  signToken,
  createSendToken,
  login,
  forgotPassword,
  resetPassword,
} from '../../controllers/auth.mjs';

jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('node:crypto');
jest.mock('../../models/student.mjs', () => ({
  default: {
    create: jest.fn(),
  },
}));
jest.mock('../../models/user.mjs');
jest.mock('../../utils/AppError.mjs', () => {
  return jest.fn().mockImplementation((message, statusCode) => ({
    message,
    statusCode,
  }));
});

jest.mock('../../utils/asyncHandler.mjs', () => {
  return (fn) => {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  };
});

describe('Auth Controller', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {
      query: {},
      params: {},
      body: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('testhost.com'),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('signToken', () => {
    const payload = { id: '1', email: 'test@example.com' };
    const secret = 'testsecret';
    const expiresIn = '1h';

    beforeAll(() => {
      process.env.JWT_SECRET = secret;
      process.env.JWT_EXPIRES_IN = expiresIn;
    });

    afterAll(() => {
      delete process.env.JWT_SECRET;
      delete process.env.JWT_EXPIRES_IN;
    });

    it('should sign the token with the correct payload and secret', () => {
      jwt.sign.mockReturnValue('signedToken');

      const token = signToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, secret, { expiresIn });
      expect(token).toBe('signedToken');
    });
  });

  describe('createSendToken', () => {
    const user = {
      _id: '1',
      email: 'test@example.com',
      password: 'password',
    };
    const statusCode = 200;
    const token = 'signedToken';

    beforeEach(() => {
      jwt.sign.mockReturnValue(token);
      process.env.JWT_SECRET = 'testsecret';
      process.env.JWT_EXPIRES_IN = '1h';
      process.env.JWT_COOKIE_EXPIRES_IN = '90';
    });

    afterEach(() => {
      delete process.env.JWT_SECRET;
      delete process.env.JWT_EXPIRES_IN;
      delete process.env.JWT_COOKIE_EXPIRES_IN;
      delete process.env.NODE_ENV;
    });

    it('should create and send token with secure cookie in production', () => {
      process.env.NODE_ENV = 'production';

      createSendToken(user, statusCode, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'jwt',
        token,
        expect.objectContaining({
          expires: expect.any(Date),
          httpOnly: true,
          secure: true,
        }),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(statusCode);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        token,
        data: { ...user, password: undefined },
      });
    });
  });

  describe('login', () => {
    const user = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedPassword',
    };

    it('should log in the user and send token', async () => {
      mockRequest.body = { email: 'test@example.com', password: 'password' };

      User.findOne.mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(user),
      }));
      bcrypt.compare.mockResolvedValue(true);

      await login(mockRequest, mockResponse, mockNext);

      expect(User.findOne).toHaveBeenCalledWith({ email: user.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockRequest.body.password,
        'hashedPassword',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        token: expect.any(String),
        data: { ...user, password: undefined },
      });
    });

    it('should handle missing email or password', async () => {
      mockRequest.body = { email: '', password: '' };

      await login(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new AppError('Please provide email and password!', 400),
      );
    });

    it('should handle incorrect email or password', async () => {
      User.findOne.mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(null),
      }));

      mockRequest.body = { email: 'wrong@example.com', password: 'password' };

      await login(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new AppError('Incorrect email or password', 401),
      );
    });
  });

  describe('forgotPassword', () => {
    const user = {
      id: '1',
      email: 'test@example.com',
      createPasswordResetToken: jest.fn(),
      save: jest.fn(),
    };

    it('should create reset token and send email', async () => {
      mockRequest.body = { email: 'test@example.com' };

      User.findOne.mockResolvedValue(user);
      user.createPasswordResetToken.mockReturnValue('resetToken');

      await forgotPassword(mockRequest, mockResponse, mockNext);

      expect(User.findOne).toHaveBeenCalledWith({
        email: mockRequest.body.email,
      });
      expect(user.createPasswordResetToken).toHaveBeenCalled();
      expect(user.save).toHaveBeenCalledWith({ validateBeforeSave: false });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: expect.any(String),
      });
    });

    it('should handle user not found', async () => {
      User.findOne.mockResolvedValueOnce(null);

      mockRequest.body = { email: 'nonexistent@example.com' };

      await forgotPassword(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new AppError('There is no user with email address.', 404),
      );
    });
  });

  describe('resetPassword', () => {
    const user = {
      id: '1',
      password: 'newpassword',
      save: jest.fn(),
    };

    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-12-31'));

      User.findOne.mockResolvedValue(user);
      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnValue({
          digest: jest.fn().mockReturnValue('hashedToken'),
        }),
      });
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should reset password and send token', async () => {
      mockRequest.params.token = 'resetToken';
      mockRequest.body = {
        password: 'newpassword',
      };

      await resetPassword(mockRequest, mockResponse, mockNext);

      const now = Date.now();

      expect(User.findOne).toHaveBeenCalledWith({
        passwordResetToken: 'hashedToken',
        passwordResetExpires: { $gt: now },
      });
      expect(user.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        token: expect.any(String),
        data: { ...user, password: undefined },
      });
    });

    it('should handle invalid or expired token', async () => {
      User.findOne.mockResolvedValueOnce(null);

      mockRequest.params.token = 'invalidToken';

      await resetPassword(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new AppError('Token is invalid or has expired', 400),
      );
    });
  });
});
