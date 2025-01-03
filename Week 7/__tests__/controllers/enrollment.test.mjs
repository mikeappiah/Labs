import Enrollment from '../../models/enrollment.mjs';
import Student from '../../models/student.mjs';
import Course from '../../models/course.mjs';
import AppError from '../../utils/AppError.mjs';

import {
  getAllStudentCourses,
  getAllCourseStudents,
  createEnrollment,
  deleteEnrollment,
  getAllEnrollments,
} from '../../controllers/enrollment.mjs';

jest.mock('../../models/enrollment.mjs');
jest.mock('../../models/student.mjs');
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

describe('Enrollment Controller', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {
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

  describe('getAllEnrollments', () => {
    const mockEnrollments = [
      {
        course: { id: '1', name: 'Course 1' },
        student: { id: '1', name: 'Student 1' },
      },
      {
        course: { id: '2', name: 'Course 2' },
        student: { id: '2', name: 'Student 2' },
      },
    ];

    it('should get all enrollments successfully', async () => {
      mockRequest.query = { page: 1, limit: 10 };

      Enrollment.find.mockImplementation(() => ({
        skip: jest.fn(() => ({
          limit: jest.fn().mockResolvedValue(mockEnrollments),
        })),
      }));

      await getAllEnrollments(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockEnrollments.length,
        data: mockEnrollments,
      });
    });

    it('should handle no enrollments found', async () => {
      mockRequest.query = { page: 1, limit: 10 };

      Enrollment.find.mockImplementation(() => ({
        skip: jest.fn(() => ({
          limit: jest.fn().mockResolvedValue([]),
        })),
      }));

      await getAllEnrollments(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        results: 0,
        data: [],
      });
    });
  });

  describe('createEnrollment', () => {
    it('should create a new enrollment successfully', async () => {
      const mockStudent = { id: 'student1' };
      const mockCourse = { id: 'course1' };
      const mockEnrollment = {
        id: 'enrollment1',
        student: 'student1',
        course: 'course1',
      };

      mockRequest.body = { student: 'student1', course: 'course1' };

      Student.findById.mockResolvedValue(mockStudent);
      Course.findById.mockResolvedValue(mockCourse);
      Enrollment.findOne.mockResolvedValue(null);
      Enrollment.create.mockResolvedValue(mockEnrollment);

      await createEnrollment(mockRequest, mockResponse, mockNext);

      expect(Student.findById).toHaveBeenCalledWith(mockRequest.body.student);
      expect(Course.findById).toHaveBeenCalledWith(mockRequest.body.course);
      expect(Enrollment.findOne).toHaveBeenCalledWith({
        student: mockRequest.body.student,
        course: mockRequest.body.course,
      });
      expect(Enrollment.create).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockEnrollment,
      });
    });

    it('should handle missing student or course ID', async () => {
      mockRequest.body = { student: '', course: '' };

      await createEnrollment(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new AppError('Student ID and Course ID are required', 400),
      );
    });

    it('should handle student not found', async () => {
      mockRequest.body = { student: 'student1', course: 'course1' };

      Student.findById.mockResolvedValue(null);

      await createEnrollment(mockRequest, mockResponse, mockNext);

      expect(Student.findById).toHaveBeenCalledWith(mockRequest.body.student);
      expect(mockNext).toHaveBeenCalledWith(
        new AppError('No student found with that ID', 404),
      );
    });

    it('should handle course not found', async () => {
      const mockStudent = { id: 'student1' };

      mockRequest.body = { student: 'student1', course: 'course1' };
      Student.findById.mockResolvedValue(mockStudent);
      Course.findById.mockResolvedValue(null);

      await createEnrollment(mockRequest, mockResponse, mockNext);

      expect(Student.findById).toHaveBeenCalledWith(mockRequest.body.student);
      expect(Course.findById).toHaveBeenCalledWith(mockRequest.body.course);
      expect(mockNext).toHaveBeenCalledWith(
        new AppError('No course found with that ID', 404),
      );
    });

    it('should handle existing enrollment', async () => {
      const mockStudent = { id: 'student1' };
      const mockCourse = { id: 'course1' };
      const mockEnrollment = {
        id: 'enrollment1',
        student: 'student1',
        course: 'course1',
      };
      mockRequest.body = { student: 'student1', course: 'course1' };
      Student.findById.mockResolvedValue(mockStudent);
      Course.findById.mockResolvedValue(mockCourse);
      Enrollment.findOne.mockResolvedValue(mockEnrollment);

      await createEnrollment(mockRequest, mockResponse, mockNext);

      expect(Student.findById).toHaveBeenCalledWith(mockRequest.body.student);
      expect(Course.findById).toHaveBeenCalledWith(mockRequest.body.course);
      expect(mockNext).toHaveBeenCalledWith(
        new AppError('Student is already enrolled in this course', 400),
      );
    });
  });

  describe('getAllStudentCourses', () => {
    it('should get all student courses successfully', async () => {
      const mockEnrollments = [
        {
          course: { id: '1', name: 'Course 1' },
          student: { id: '1', name: 'Student 1' },
        },
        {
          course: { id: '2', name: 'Course 2' },
          student: { id: '2', name: 'Student 2' },
        },
      ];

      mockRequest.params.studentId = 'student1';

      Enrollment.find.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockEnrollments),
      }));

      await getAllStudentCourses(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockEnrollments.map((enrollment) => enrollment.course),
      });
    });

    it('should handle no enrollments found', async () => {
      mockRequest.params.studentId = 'student1';
      Enrollment.find.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(null),
      }));

      await getAllStudentCourses(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        new AppError('No enrollment found with that student ID', 404),
      );
    });
  });

  describe('getAllCourseStudents', () => {
    it('should get all course students successfully', async () => {
      const mockCourse = { id: 'course1' };
      const mockEnrollments = [
        { student: { id: '1', name: 'Student 1' } },
        { student: { id: '2', name: 'Student 2' } },
      ];

      mockRequest.params.courseCode = 'courseCode1';

      Course.findOne.mockResolvedValue(mockCourse);

      Enrollment.find.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockEnrollments),
      }));

      await getAllCourseStudents(mockRequest, mockResponse, mockNext);

      expect(Course.findOne).toHaveBeenCalledWith({
        code: mockRequest.params.courseCode,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockEnrollments.map((enrollment) => enrollment.student),
      });
    });

    it('should handle no course found', async () => {
      mockRequest.params.courseCode = 'courseCode1';

      Course.findOne.mockResolvedValue(null);

      await getAllCourseStudents(mockRequest, mockResponse, mockNext);

      expect(Course.findOne).toHaveBeenCalledWith({
        code: mockRequest.params.courseCode,
      });
      expect(mockNext).toHaveBeenCalledWith(
        new AppError('No course found with that course code', 404),
      );
    });

    it('should handle no enrollments found', async () => {
      const mockCourse = { id: 'course1' };

      mockRequest.params.courseCode = 'courseCode1';

      Course.findOne.mockResolvedValue(mockCourse);

      Enrollment.find.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(null),
      }));

      await getAllCourseStudents(mockRequest, mockResponse, mockNext);

      expect(Course.findOne).toHaveBeenCalledWith({
        code: mockRequest.params.courseCode,
      });
      expect(mockNext).toHaveBeenCalledWith(
        new AppError('No enrollment found with that course code', 404),
      );
    });
  });

  describe('deleteEnrollment', () => {
    it('should delete an enrollment successfully', async () => {
      const mockEnrollment = {
        id: 'enrollment1',
        student: 'student1',
        course: 'course1',
      };
      const mockStudent = {
        id: 'student1',
        courses: ['course1'],
        save: jest.fn().mockResolvedValue(true),
      };

      mockRequest.params = { enrollmentId: 'enrollment1' };

      Enrollment.findByIdAndDelete.mockResolvedValue(mockEnrollment);
      Student.findById.mockResolvedValue(mockStudent);

      await deleteEnrollment(mockRequest, mockResponse, mockNext);

      expect(Enrollment.findByIdAndDelete).toHaveBeenCalledWith(
        mockRequest.params.enrollmentId,
      );
      expect(Student.findById).toHaveBeenCalledWith(mockStudent.id);
      expect(mockStudent.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: null,
      });
    });

    it('should handle enrollment not found', async () => {
      mockRequest.params = { enrollmentId: 'enrollment1' };
      Enrollment.findByIdAndDelete.mockResolvedValue(null);

      await deleteEnrollment(mockRequest, mockResponse, mockNext);

      expect(Enrollment.findByIdAndDelete).toHaveBeenCalledWith(
        mockRequest.params.enrollmentId,
      );
      expect(mockNext).toHaveBeenCalledWith(
        new AppError('No enrollment found with that ID', 404),
      );
    });

    it('should handle student not found', async () => {
      const mockEnrollment = {
        id: 'enrollment1',
        student: 'student1',
        course: 'course1',
      };
      mockRequest.params = { enrollmentId: 'enrollment1' };
      Enrollment.findByIdAndDelete.mockResolvedValue(mockEnrollment);
      Student.findById.mockResolvedValue(null);

      await deleteEnrollment(mockRequest, mockResponse, mockNext);
      expect(Enrollment.findByIdAndDelete).toHaveBeenCalledWith(
        mockRequest.params.enrollmentId,
      );
      expect(Student.findById).toHaveBeenCalledWith(mockEnrollment.student);

      expect(mockNext).toHaveBeenCalledWith(
        new AppError('No student found with that ID', 404),
      );
    });
  });
});
