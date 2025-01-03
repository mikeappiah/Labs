import errorController, {
  handleCastErrorDB,
  handleDuplicateFieldsDB,
  handleValidationErrorDB,
  handleJWTError,
  handleJWTExpiredError,
  sendDevError,
  sendProdError,
} from '../../controllers/error.mjs';
import AppError from '../../utils/AppError.mjs';
import logger from '../../utils/logger.mjs';

jest.mock('../../utils/logger.mjs');
jest.mock('../../utils/AppError.mjs');

describe('Error Controller', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();

    AppError.mockImplementation((message, statusCode) => ({
      message,
      statusCode,
      status: 'error',
    }));
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  describe('handleCastErrorDB', () => {
    it('should format cast error message correctly', () => {
      const error = { path: 'testPath', value: 'testValue' };
      const result = handleCastErrorDB(error);

      expect(AppError).toHaveBeenCalledWith('Invalid testPath:testValue', 400);
      expect(result).toEqual({
        message: 'Invalid testPath:testValue',
        statusCode: 400,
        status: 'error',
      });
    });
  });

  describe('handleDuplicateFieldsDB', () => {
    it('should format duplicate fields error message correctly', () => {
      const error = { keyValue: { testField: 'testValue' } };
      const result = handleDuplicateFieldsDB(error);

      expect(AppError).toHaveBeenCalledWith(
        'Duplicate field value:testValue. Please use another value',
        400,
      );
      expect(result).toEqual({
        message: 'Duplicate field value:testValue. Please use another value',
        statusCode: 400,
        status: 'error',
      });
    });
  });

  describe('handleValidationErrorDB', () => {
    it('should format validation error message correctly', () => {
      const error = {
        errors: {
          field1: { message: 'First error' },
          field2: { message: 'Second error' },
        },
      };
      const result = handleValidationErrorDB(error);

      expect(AppError).toHaveBeenCalledWith(
        'Invalid input data: First error. Second error',
        400,
      );
      expect(result).toEqual({
        message: 'Invalid input data: First error. Second error',
        statusCode: 400,
        status: 'error',
      });
    });
  });

  describe('handleJWTError', () => {
    it('should return appropriate JWT error message', () => {
      const result = handleJWTError();

      expect(AppError).toHaveBeenCalledWith(
        'Invalid token. Please log in again.',
        401,
      );
      expect(result).toEqual({
        message: 'Invalid token. Please log in again.',
        statusCode: 401,
        status: 'error',
      });
    });
  });

  describe('handleJWTExpiredError', () => {
    it('should return appropriate JWT expired error message', () => {
      const result = handleJWTExpiredError();

      expect(AppError).toHaveBeenCalledWith(
        'Your token has expired. Please log in again.',
        401,
      );
      expect(result).toEqual({
        message: 'Your token has expired. Please log in again.',
        statusCode: 401,
        status: 'error',
      });
    });
  });

  describe('sendDevError', () => {
    it('should send detailed error response in development', () => {
      const error = {
        statusCode: 500,
        status: 'error',
        message: 'Test error message',
        stack: 'Test stack trace',
      };

      sendDevError(error, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        error,
        message: 'Test error message',
        stack: 'Test stack trace',
      });
    });
  });

  describe('sendProdError', () => {
    it('should send operational error response in production', () => {
      const error = Object.create(AppError.prototype);
      Object.assign(error, {
        statusCode: 400,
        status: 'error',
        message: 'Test operational error',
      });

      sendProdError(error, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Test operational error',
      });
    });

    it('should send generic error response for programming errors', () => {
      const error = new Error('Test programming error');

      sendProdError(error, mockResponse);

      expect(logger.error).toHaveBeenCalledWith(
        'Error: Test programming error',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Something went very wrong!',
      });
    });
  });

  describe('main error middleware', () => {
    it('should handle errors in development mode', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Test error');
      error.stack = 'Test stack';

      errorController(error, mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        error: expect.any(Error),
        message: 'Test error',
        stack: 'Test stack',
      });
    });

    describe('production error handling', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production';
      });

      it('should handle each error type appropriately', () => {
        const testCases = [
          {
            error: {
              name: 'CastError',
              path: 'testPath',
              value: 'testValue',
              statusCode: 400,
              message: 'Invalid testPath: testValue.',
            },
          },
          {
            error: {
              code: 11000,
              keyValue: { testField: 'testValue' },
              statusCode: 400,
              message:
                'Duplicate field value: testValue . Please use another value',
            },
          },
          {
            error: {
              name: 'ValidationError',
              errors: { test: { message: 'Test message' } },
              statusCode: 400,
              message: 'Invalid input data: Test message',
            },
          },
          {
            error: {
              name: 'JsonWebTokenError',
              statusCode: 401,
              message: 'Invalid token. Please log in again.',
            },
          },
          {
            error: {
              name: 'TokenExpiredError',
              statusCode: 400,
              message: 'Your token has expired. Please log in again.',
            },
          },
        ];

        testCases.forEach(({ error }) => {
          errorController(error, mockRequest, mockResponse, mockNext);
        });
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Something went very wrong!',
        });

        jest.clearAllMocks();
      });
    });
  });
});
