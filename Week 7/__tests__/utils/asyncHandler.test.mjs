import asyncHandler from '../../utils/asyncHandler.mjs';

describe('asyncHandler', () => {
  it('should execute the passed function and handle successful response', async () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = jest.fn();
    const mockFn = jest.fn().mockResolvedValue('success');

    const wrappedFn = asyncHandler(mockFn);
    await wrappedFn(mockReq, mockRes, mockNext);

    expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle errors and pass them to next middleware', async () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = jest.fn();
    const mockError = new Error('Test error');
    const mockFn = jest.fn().mockRejectedValue(mockError);

    const wrappedFn = asyncHandler(mockFn);
    await wrappedFn(mockReq, mockRes, mockNext);

    expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(mockError);
  });
});
