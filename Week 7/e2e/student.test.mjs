import createApp from '../createApp.mjs';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';

import Student from '../models/student.mjs';
import User from '../models/user.mjs';
import { signToken } from '../controllers/auth.mjs';

jest.mock('../config/swagger.mjs', () => ({
  default: {},
}));

let app;
let mongoServer;

describe('Student Integration Tests', () => {
  let instructor;
  let student;
  let instructorToken;
  let studentToken;

  const testInstructor = {
    firstName: 'Albert',
    lastName: 'Einstein',
    password: 'Test1234!',
    dateOfBirth: '1980-01-01',
    phoneNumber: '1234567890',
    email: 'alberteinstein@staff.university.edu',
    department: 'Computer Science',
    role: 'Instructor',
  };

  const testStudent = {
    firstName: 'Reece',
    lastName: 'James',
    password: 'Test5678!',
    dateOfBirth: '2000-01-01',
    phoneNumber: '0987654321',
    email: 'reeecejames@st.university.edu',
    grade: '2nd Year',
    gpa: 3.5,
    role: 'Student',
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    app = createApp();
    process.env.NODE_ENV = 'development';
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Student.deleteMany({});

    student = await Student.create(testStudent);
    instructor = await User.create(testInstructor);

    studentToken = signToken({ id: student._id, email: student.email });
    instructorToken = signToken({
      id: instructor._id,
      email: instructor.email,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    delete process.env.NODE_ENV;
  });

  describe('Authentication and Authorization', () => {
    it('should reject requests without token', async () => {
      const response = await request(app).get('/api/students');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        'You are not logged in! Please log in to get access.',
      );
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('jwt malformed');
    });
  });

  describe('GET /api/students', () => {
    it('should get all students when authenticated as instructor', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true); // Updated expectation
      expect(response.body.data[0]).toMatchObject({
        // Updated to check first item in array
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
      });
    });

    it('should fail when authenticated as student', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe(
        'You do not have permission to perform this action',
      );
    });
  });

  describe('GET /api/students/:id', () => {
    it('should get student by ID', async () => {
      const response = await request(app)
        .get(`/api/students/${student._id}`)
        .set('Authorization', `Bearer ${instructorToken}`); // Added auth token

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
      });
    });

    it('should fail with invalid ID', async () => {
      const response = await request(app)
        .get('/api/students/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`); // Added auth token

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('No student found with that ID');
    });
  });

  describe('POST /api/students', () => {
    const newStudent = {
      firstName: 'New',
      lastName: 'Student',
      password: 'NewPass123!',
      dateOfBirth: '2001-01-01',
      phoneNumber: '1231231234',
      email: 'newstudent@st.university.edu',
      grade: '1st Year',
      gpa: 3.0,
      role: 'Student', // Added role field
    };

    it('should create a new student when authenticated as instructor', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(newStudent);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        firstName: newStudent.firstName,
        lastName: newStudent.lastName,
        email: newStudent.email,
      });
    });
  });

  describe('PATCH /api/students/:id', () => {
    const update = {
      grade: '3rd Year',
      gpa: 3.8,
    };

    it('should update student when authenticated as instructor', async () => {
      // Updated test description
      const response = await request(app)
        .patch(`/api/students/${student._id}`)
        .set('Authorization', `Bearer ${instructorToken}`) // Added auth token
        .send(update);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.grade).toBe(update.grade);
      expect(response.body.data.gpa).toBe(update.gpa);
    });

    it('should fail with invalid ID', async () => {
      const response = await request(app)
        .patch('/api/students/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`) // Added auth token
        .send(update);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('No student found with that ID');
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('should delete student when authenticated as instructor', async () => {
      const response = await request(app)
        .delete(`/api/students/${student._id}`)
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(response.status).toBe(204);
    });

    it('should fail when authenticated as student', async () => {
      const response = await request(app)
        .delete(`/api/students/${student._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe(
        'You do not have permission to perform this action',
      );
    });

    it('should fail with invalid ID', async () => {
      const response = await request(app)
        .delete('/api/students/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('No student found with that ID');
    });
  });
});
