import Course from '../../models/course.mjs';
import AppError from '../../utils/AppError.mjs';

import {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../../controllers/course.mjs';

jest.mock('../../models/course.mjs');
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

describe('Course Controller', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {
      query: {},
      params: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAllCourses', () => {
    const mockCourses = [
      {
        id: '1',
        name: 'Introduction to Computer Science',
        code: 'cs101',
        credits: 3,
        instructors: [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            department: 'Computer Science',
          },
        ],
      },
      {
        id: '2',
        name: 'Linear Algebra for Engineers',
        code: 'math102',
        credits: 4,
        instructors: [
          {
            id: '1',
            firstName: 'Robert',
            lastName: 'Johnson',
            department: 'Mathematics',
          },
        ],
      },
    ];

    it('should get all courses successfully', async () => {
      mockRequest.query = { page: 1, limit: 10 };

      const mockPopulate = jest.fn().mockResolvedValue(mockCourses);
      const mockLimit = jest.fn(() => ({ populate: mockPopulate }));
      const mockSkip = jest.fn(() => ({ limit: mockLimit }));

      Course.find.mockImplementation(() => ({ skip: mockSkip }));

      await getAllCourses(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockCourses.length,
        data: mockCourses,
      });
    });

    it('should handle no courses found', async () => {
      mockRequest.query = { page: 1, limit: 10 };

      const mockPopulate = jest.fn().mockResolvedValue([]);
      const mockLimit = jest.fn(() => ({ populate: mockPopulate }));
      const mockSkip = jest.fn(() => ({ limit: mockLimit }));

      Course.find.mockImplementation(() => ({ skip: mockSkip }));

      await getAllCourses(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        results: 0,
        data: [],
      });
    });
  });

  describe('getCourse', () => {
    const mockCourse = {
      id: '1',
      name: 'Introduction to Computer Science',
      code: 'cs101',
      credits: 3,
    };

    it('should get a single course successfully', async () => {
      mockRequest.params.courseCode = 'cs101';
      Course.findOne.mockResolvedValue(mockCourse);

      await getCourse(mockRequest, mockResponse, mockNext);

      expect(Course.findOne).toHaveBeenCalledWith({
        code: mockRequest.params.courseCode,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockCourse,
      });
    });

    it('should handle a course not found', async () => {
      mockRequest.params.courseCode = 'nonexistent';
      Course.findOne.mockResolvedValue(null);

      await getCourse(mockRequest, mockResponse, mockNext);

      expect(Course.findOne).toHaveBeenCalledWith({
        code: mockRequest.params.courseCode,
      });
      expect(mockNext).toHaveBeenCalledWith(
        new AppError('No course found with that course code', 404),
      );
    });
  });

  describe('createCourse', () => {
    const newCourse = {
      name: 'Communication Skills',
      code: 'engl101',
      credits: 1,
    };

    it('should create a course successfully', async () => {
      mockRequest.body = newCourse;
      Course.create.mockResolvedValue(newCourse);

      await createCourse(mockRequest, mockResponse);

      expect(Course.create).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: newCourse,
      });
    });
  });

  describe('updateCourse', () => {
    const updatedCourse = { id: '1', credits: 6 };

    it('should update a course successfully', async () => {
      mockRequest.params.courseCode = 'cs101';
      mockRequest.body = { credits: 6 };
      Course.findOneAndUpdate.mockResolvedValue(updatedCourse);

      await updateCourse(mockRequest, mockResponse, mockNext);

      expect(Course.findOneAndUpdate).toHaveBeenCalledWith(
        { code: mockRequest.params.courseCode },
        mockRequest.body,
        { new: true, runValidators: true },
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: updatedCourse,
      });
    });

    it('should handle course not found during update', async () => {
      mockRequest.params.courseCode = 'nonexistent';
      Course.findOneAndUpdate.mockResolvedValue(null);

      await updateCourse(mockRequest, mockResponse, mockNext);

      expect(Course.findOneAndUpdate).toHaveBeenCalledWith(
        {
          code: mockRequest.params.courseCode,
        },
        mockRequest.body,
        { new: true, runValidators: true },
      );
      expect(mockNext).toHaveBeenCalledWith(
        new AppError('No course found with that course code', 404),
      );
    });
  });

  describe('deleteCourse', () => {
    it('should delete a course successfully', async () => {
      mockRequest.params.courseCode = 'cs101';
      Course.findOneAndDelete.mockResolvedValue({ id: '1' });

      await deleteCourse(mockRequest, mockResponse, mockNext);

      expect(Course.findOneAndDelete).toHaveBeenCalledWith({ code: 'cs101' });
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: null,
      });
    });

    it('should handle course not found during deletion', async () => {
      mockRequest.params.courseCode = 'nonexistent';
      Course.findOneAndDelete.mockResolvedValue(null);

      await deleteCourse(mockRequest, mockResponse, mockNext);

      expect(Course.findOneAndDelete).toHaveBeenCalledWith({
        code: mockRequest.params.courseCode,
      });
      expect(mockNext).toHaveBeenCalledWith(
        new AppError('No course found with that course code', 404),
      );
    });
  });
});
