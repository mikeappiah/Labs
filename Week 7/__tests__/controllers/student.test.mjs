import Student from '../../models/student.mjs';
import AppError from '../../utils/AppError.mjs';

import {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../../controllers/student.mjs';

jest.mock('../../models/student.mjs');
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

describe('Student Controller', () => {
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

  describe('getAllStudents', () => {
    const mockStudents = [
      { id: '1', firstName: 'Michael', lastName: 'Appiah' },
      { id: '2', firstName: 'Emmanuel', lastName: 'Asidigbe' },
    ];

    it('should get all students successfully', async () => {
      mockRequest.query = { page: 1, limit: 10 };

      Student.find.mockImplementation(() => ({
        skip: jest.fn(() => ({
          limit: jest.fn().mockResolvedValue(mockStudents),
        })),
      }));

      await getAllStudents(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockStudents.length,
        data: mockStudents,
      });
    });

    it('should handle no students found', async () => {
      mockRequest.query = { page: 1, limit: 10 };
      Student.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });

      await getAllStudents(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        results: 0,
        data: [],
      });
    });
  });

  describe('getStudent', () => {
    const mockStudent = { id: '1', firstName: 'Michael', lastName: 'Appiah' };

    it('should get a single student successfully', async () => {
      mockRequest.params.id = '1';
      Student.findById.mockResolvedValue(mockStudent);

      await getStudent(mockRequest, mockResponse, mockNext);

      expect(Student.findById).toHaveBeenCalledWith(mockRequest.params.id);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockStudent,
      });
    });

    it('should handle a student not found', async () => {
      mockRequest.params.id = 'nonexistent';
      Student.findById.mockResolvedValue(null);

      await getStudent(mockRequest, mockResponse, mockNext);

      expect(Student.findById).toHaveBeenCalledWith(mockRequest.params.id);
      expect(mockNext).toHaveBeenCalledWith(
        new AppError('No student found with that ID', 404),
      );
    });
  });

  describe('createStudent', () => {
    const newStudent = { firstName: 'Emmanuel', lastName: 'Asidigbe' };

    it('should create a student successfully', async () => {
      mockRequest.body = newStudent;
      Student.create.mockResolvedValue(newStudent);

      await createStudent(mockRequest, mockResponse, mockNext);

      expect(Student.create).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: newStudent,
      });
    });
  });

  describe('updateStudent', () => {
    const updatedStudent = { id: '1', firstName: 'Updated Name' };

    it('should update a student successfully', async () => {
      mockRequest.params.id = '1';
      mockRequest.body = { firstName: 'Updated Name' };
      Student.findByIdAndUpdate.mockResolvedValue(updatedStudent);

      await updateStudent(mockRequest, mockResponse, mockNext);

      expect(Student.findByIdAndUpdate).toHaveBeenCalledWith(
        mockRequest.params.id,
        mockRequest.body,
        { new: true, runValidators: true },
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: updatedStudent,
      });
    });

    it('should handle student not found during update', async () => {
      mockRequest.params.id = 'nonexistent';
      Student.findByIdAndUpdate.mockResolvedValue(null);

      await updateStudent(mockRequest, mockResponse, mockNext);

      expect(Student.findByIdAndUpdate).toHaveBeenCalledWith(
        mockRequest.params.id,
        mockRequest.body,
        { new: true, runValidators: true },
      );
      expect(mockNext).toHaveBeenCalledWith(
        new AppError('No student found with that ID', 404),
      );
    });
  });

  describe('deleteStudent', () => {
    it('should delete a student successfully', async () => {
      mockRequest.params.id = '1';
      Student.findByIdAndDelete.mockResolvedValue({ id: '1' });

      await deleteStudent(mockRequest, mockResponse, mockNext);

      expect(Student.findByIdAndDelete).toHaveBeenCalledWith(
        mockRequest.params.id,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: null,
      });
    });

    it('should handle student not found during deletion', async () => {
      mockRequest.params.id = 'nonexistent';
      Student.findByIdAndDelete.mockResolvedValue(null);

      await deleteStudent(mockRequest, mockResponse, mockNext);

      expect(Student.findByIdAndDelete).toHaveBeenCalledWith(
        mockRequest.params.id,
      );
      expect(mockNext).toHaveBeenCalledWith(
        new AppError('No student found with that ID', 404),
      );
    });
  });
});
