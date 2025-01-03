import AppError from '../../utils/AppError.mjs';

describe('AppError', () => {
  it('should create error with status "fail" for 4xx status codes', () => {
    const error = new AppError('Bad Request', 400);
    expect(error.message).toBe('Bad Request');
    expect(error.status).toBe('fail');
    expect(error.statusCode).toBe(400);
    expect(error instanceof Error).toBe(true);
  });

  it('should create error with status "error" for 5xx status codes', () => {
    const error = new AppError('Server Error', 500);
    expect(error.message).toBe('Server Error');
    expect(error.status).toBe('error');
    expect(error.statusCode).toBe(500);
    expect(error instanceof Error).toBe(true);
  });

  it('should handle non-numeric status codes', () => {
    const error = new AppError('Test Error', '400');
    expect(error.message).toBe('Test Error');
    expect(error.status).toBe('fail');
    expect(error.statusCode).toBe('400');
    expect(error instanceof Error).toBe(true);
  });
});
