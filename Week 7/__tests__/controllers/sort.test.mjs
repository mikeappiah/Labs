import redis from '../../__mocks__/redis.mjs';
import { sortStudents, sortCourses } from '../../controllers/sort.mjs';
import quickSort from '../../utils/quickSort.mjs';
import Student from '../../models/student.mjs';
import Course from '../../models/course.mjs';
import logger from '../../utils/logger.mjs';
import AppError from '../../utils/AppError.mjs';

jest.mock('../../__mocks__/redis.mjs');
jest.mock('../../utils/quickSort.mjs');
jest.mock('../../models/student.mjs');
jest.mock('../../models/course.mjs');
jest.mock('../../utils/logger.mjs');
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

describe('Sort Controller', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeAll(() => {
    process.env.REDIS_URL = 'redis://localhost:6379';
  });

  afterAll(() => {
    delete process.env.REDIS_URL;
  });

  beforeEach(() => {
    mockRequest = {
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('sortStudents', () => {
    it('should handle missing field or order parameter', async () => {
      mockRequest.query = {};

      await sortStudents(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new AppError('Field or order query missing', 400),
      );
    });

    it('should return cached student data if available', async () => {
      mockRequest.query = { field: 'gpa', order: 'asc' };
      const cachedData = {
        field: 'name',
        order: 'asc',
        data: [
          { id: '1', firstName: 'Michael', lastName: 'Appiah', gpa: 3.2 },
          { id: '2', firstName: 'Emmanuel', lastName: 'Asidigbe', gpa: 3.8 },
        ],
      };
      redis.createClient().get.mockResolvedValue(JSON.stringify(cachedData));

      await sortStudents(mockRequest, mockResponse, mockNext);

      expect(redis.createClient().get).toHaveBeenCalledWith(
        'Student_sorted_gpa_asc',
      );
      expect(logger.info).toHaveBeenCalledWith('Cache hit');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(cachedData);
    });

    it('should sort and cache student data if not in cache', async () => {
      mockRequest.query = { field: 'gpa', order: 'desc' };
      const data = [
        { id: '1', firstName: 'Michael', lastName: 'Appiah', gpa: 3.2 },
        { id: '2', firstName: 'Emmanuel', lastName: 'Asidigbe', gpa: 3.8 },
      ];
      const sortedData = [
        { id: '2', firstName: 'Emmanuel', lastName: 'Asidigbe', gpa: 3.8 },
        { id: '1', firstName: 'Michael', lastName: 'Appiah', gpa: 3.2 },
      ];

      redis.createClient().get.mockResolvedValue(null);
      Student.find.mockResolvedValue(data);
      quickSort.mockReturnValue(sortedData);

      await sortStudents(mockRequest, mockResponse, mockNext);

      expect(logger.info).toHaveBeenCalledWith('Cache miss');
      expect(Student.find).toHaveBeenCalled();
      expect(quickSort).toHaveBeenCalledWith(data, 'gpa', 'desc');
      expect(redis.createClient().setEx).toHaveBeenCalledWith(
        'Student_sorted_gpa_desc',
        3600,
        JSON.stringify({
          field: mockRequest.query.field,
          order: mockRequest.query.order,
          data: sortedData,
        }),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        field: mockRequest.query.field,
        order: mockRequest.query.order,
        data: sortedData,
      });
    });
  });

  describe('sortCourses', () => {
    it('should handle missing field or order parameter', async () => {
      mockRequest.query = {};

      await sortCourses(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new AppError('Field or order query missing', 400),
      );
    });

    it('should return cached course data if available', async () => {
      mockRequest.query = { field: 'name', order: 'asc' };
      const cachedData = {
        field: 'name',
        order: 'asc',
        data: [
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
        ],
      };
      redis.createClient().get.mockResolvedValue(JSON.stringify(cachedData));

      await sortCourses(mockRequest, mockResponse, mockNext);

      expect(redis.createClient().get).toHaveBeenCalledWith(
        'Course_sorted_name_asc',
      );
      expect(logger.info).toHaveBeenCalledWith('Cache hit');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(cachedData);
    });

    it('should sort and cache course data if not in cache', async () => {
      mockRequest.query = { field: 'name', order: 'desc' };
      const data = [
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
      const sortedData = [
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
        ,
      ];

      redis.createClient().get.mockResolvedValue(null);
      Course.find.mockResolvedValue(data);
      quickSort.mockReturnValue(sortedData);

      await sortCourses(mockRequest, mockResponse, mockNext);

      expect(logger.info).toHaveBeenCalledWith('Cache miss');
      expect(Course.find).toHaveBeenCalled();
      expect(quickSort).toHaveBeenCalledWith(data, 'name', 'desc');
      expect(redis.createClient().setEx).toHaveBeenCalledWith(
        'Course_sorted_name_desc',
        3600,
        JSON.stringify({
          field: mockRequest.query.field,
          order: mockRequest.query.order,
          data: sortedData,
        }),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        field: mockRequest.query.field,
        order: mockRequest.query.order,
        data: sortedData,
      });
    });
  });
});
