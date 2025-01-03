import getPagination from '../../utils/pagination.mjs';
import AppError from '../../utils/AppError.mjs';

jest.mock('../../utils/AppError.mjs', () => {
  return jest.fn().mockImplementation((message, statusCode) => ({
    message,
    statusCode,
  }));
});

describe('getPagination', () => {
  let mockNext;

  beforeEach(() => {
    mockNext = jest.fn();
    AppError.mockClear();
  });

  it('should return default pagination when no query params provided', () => {
    const req = { query: {} };
    const result = getPagination(req, mockNext);

    expect(result).toEqual({
      limit: 100,
      skip: 0,
    });
  });

  it('should calculate correct skip value based on page and limit', () => {
    const req = { query: { page: '2', limit: '10' } };
    const result = getPagination(req, mockNext);

    expect(result).toEqual({
      limit: 10,
      skip: 10,
    });
  });

  it('should throw AppError for page or limit less than 1', () => {
    const req = { query: { page: '-1', limit: '10' } };
    getPagination(req, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(AppError).toHaveBeenCalledWith(
      'Invalid page or limit parameter',
      400,
    );
  });
});
