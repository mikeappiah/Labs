import winston from 'winston';
import logger from '../../utils/logger.mjs';

jest.mock('winston', () => {
  const mockFormat = {
    combine: jest.fn(),
    errors: jest.fn(() => 'mockErrorFormat'),
    json: jest.fn(() => 'mockJsonFormat'),
  };

  const mockTransport = jest.fn();

  return {
    createLogger: jest.fn((config) => ({
      level: config?.level || 'info',
      format: config?.format,
      transports: config?.transports || [new mockTransport()],
      exceptionHandlers: config?.exceptionHandlers || [new mockTransport()],
      rejectionHandlers: config?.rejectionHandlers || [new mockTransport()],
    })),
    format: mockFormat,
    transports: {
      Console: mockTransport,
    },
  };
});

describe('Logger Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.LOG_LEVEL;
    jest.isolateModules(() => {
      require('../../utils/logger.mjs');
    });
  });

  it('should create a logger with default info level when LOG_LEVEL is not set', () => {
    const calls = winston.createLogger.mock.calls[0][0];
    expect(calls?.level || 'info').toBe('info');
  });

  it('should use LOG_LEVEL from environment when set', () => {
    process.env.LOG_LEVEL = 'debug';
    jest.isolateModules(() => {
      require('../../utils/logger.mjs');
    });
    const calls = winston.createLogger.mock.calls[1][0];
    expect(calls.level).toBe('debug');
  });

  it('should configure error formatting with stack traces', () => {
    expect(winston.format.errors).toHaveBeenCalledWith({
      stack: true,
    });
  });

  it('should use JSON format', () => {
    expect(winston.format.json).toHaveBeenCalled();
  });

  it('should combine multiple formats', () => {
    expect(winston.format.combine).toHaveBeenCalledWith(
      'mockErrorFormat',
      'mockJsonFormat',
    );
  });

  it('should configure console transport', () => {
    expect(winston.transports.Console).toHaveBeenCalled();
  });

  it('should configure exception and rejection handlers', () => {
    const loggerConfig = winston.createLogger.mock.calls[0][0];
    expect(loggerConfig.exceptionHandlers).toHaveLength(1);
    expect(loggerConfig.exceptionHandlers[0]).toBeInstanceOf(
      winston.transports.Console,
    );
    expect(loggerConfig.rejectionHandlers).toHaveLength(1);
    expect(loggerConfig.rejectionHandlers[0]).toBeInstanceOf(
      winston.transports.Console,
    );
  });

  it('should export a logger instance', () => {
    expect(logger).toBeDefined();
  });
});
