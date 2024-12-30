import Student from '../models/student.mjs';
import AppError from '../utils/AppError.mjs';
import APIFeatures from '../utils/APIFeatures.mjs';

import {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/student.mjs';

import mockAPIFeatures from '../__mocks__/mockAPIFeatutes.mjs';

/* Mock dependencies */
jest.mock('../models/student.mjs');
jest.mock('../utils/AppError.mjs');
jest.mock('../utils/APIFeatures');

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
      { id: 1, firstName: 'Mike', lastName: 'Appiah' },
      { id: 2, firstName: 'John', lastName: 'Doe' },
    ];

    it('should get all students and handle API features with query parameters', async () => {
      // Set up initial mock
      mockAPIFeatures(mockStudents);

      // Test case 1: Without query parameters
      await getAllStudents(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockStudents.length,
        data: mockStudents,
      });

      // Clear mocks for second test case
      jest.clearAllMocks();
      mockResponse.status.mockReturnThis(); // Restore the chain

      // Test case 2: With query parameters
      mockRequest.query = {
        page: '1',
        limit: '10',
        sort: 'lastName',
        fields: 'firstName,lastName',
      };

      // Set up mock again for second test case
      mockAPIFeatures(mockStudents);

      await getAllStudents(mockRequest, mockResponse);

      expect(APIFeatures).toHaveBeenCalledWith(
        expect.anything(),
        mockRequest.query,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockStudents.length,
        data: mockStudents,
      });
    });

    it('should handle empty results', async () => {
      mockAPIFeatures([]);

      await getAllStudents(mockRequest, mockResponse);

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

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockStudent,
      });
    });

    it('should handle student not found', async () => {
      mockRequest.params.id = 'nonexistent';
      Student.findById.mockResolvedValue(null);

      await getStudent(mockRequest, mockResponse, mockNext);

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

      await createStudent(mockRequest, mockResponse);

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

      expect(mockNext).toHaveBeenCalledWith(
        new AppError('No student found with that ID', 404),
      );
    });
  });
});
