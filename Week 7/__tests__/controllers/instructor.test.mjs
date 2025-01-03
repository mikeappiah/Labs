import Instructor from '../../models/instructor.mjs';

import {
  getAllInstructors,
  createInstructor,
} from '../../controllers/instructor.mjs';

jest.mock('../../models/instructor');

describe('Instructor Controller', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {
      params: {},
      query: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('getAllInstructors', () => {
    const mockInstructors = [
      {
        id: '1',
        firstName: 'Albert',
        lastName: 'Einstein',
        department: 'Mathematics',
      },
      {
        id: '3',
        firstName: 'Nikola',
        lastName: 'Tesla',
        department: 'Electrical Engineering',
      },
    ];

    it('should get all instructors successfully', async () => {
      mockRequest.query = { page: 1, limit: 10 };

      Instructor.find.mockImplementation(() => ({
        skip: jest.fn(() => ({
          limit: jest.fn().mockResolvedValue(mockInstructors),
        })),
      }));

      await getAllInstructors(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        results: mockInstructors.length,
        data: mockInstructors,
      });
    });

    it('should handle no instructors found', async () => {
      mockRequest.query = { page: 1, limit: 10 };
      Instructor.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });

      await getAllInstructors(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        results: 0,
        data: [],
      });
    });
  });

  describe('createInstructor', () => {
    const newInstructor = {
      firstName: 'Marie',
      lastName: 'Curie',
      department: 'Chemistry',
    };

    it('should create an instructor successfully', async () => {
      mockRequest.body = newInstructor;
      Instructor.create.mockResolvedValue(newInstructor);

      await createInstructor(mockRequest, mockResponse);

      expect(Instructor.create).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: newInstructor,
      });
    });
  });
});
