import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import createApp from '../createApp.mjs';
import Course from '../models/course.mjs';
import Student from '../models/student.mjs';
import Enrollment from '../models/enrollment.mjs';
import { signToken } from '../controllers/auth.mjs';
import Instructor from '../models/instructor.mjs';

jest.mock('../config/swagger.mjs', () => ({
  default: {},
}));

let app;
let mongoServer;

describe('Enrollment Integration Tests', () => {
  let student;
  let instructor;
  let course;
  let studentToken;
  let instructorToken;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    app = createApp();
    process.env.NODE_ENV = 'development';
  });

  beforeEach(async () => {
    await Student.deleteMany({});
    await Instructor.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});

    student = await Student.create({
      firstName: 'James',
      lastName: 'Kumbour',
      password: 'Str0ngP@ssword123!',
      dateOfBirth: '2002-10-20',
      phoneNumber: '0207802073',
      grade: '1st Year',
      gpa: 2.8,
      email: 'jameskumbour@st.university.edu',
      courses: [],
      role: 'Student',
    });

    instructor = await Instructor.create({
      firstName: 'Michael',
      lastName: 'Faraday',
      email: 'michaelfaraday@staff.university.edu',
      password: 'Str0ngPassword123!',
      dateOfBirth: '1985-04-25',
      phoneNumber: '123-456-7890',
      department: 'Computer Science',
      role: 'Instructor',
    });

    course = await Course.create({
      name: 'Linear Algebra for Engineers',
      code: 'math102',
      description:
        'Explores linear equations, matrices, vector spaces, and eigenvalues with practical applications in engineering.',
      department: 'Mathematics',
      credits: 3,
      instructor: instructor._id,
    });

    studentToken = signToken({
      id: student._id,
      email: student.email,
      role: student.role,
    });
    instructorToken = signToken({
      id: instructor._id,
      email: instructor.email,
      role: instructor.role,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    delete process.env.NODE_ENV;
  });

  describe('Authentication and Authorization', () => {
    it('should reject requests without token', async () => {
      const response = await request(app).get('/api/enrollments');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        'You are not logged in! Please log in to get access.',
      );
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/enrollments')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('jwt malformed');
    });
  });

  describe('GET /api/enrollments', () => {
    beforeEach(async () => {
      await Enrollment.create({
        student: student._id,
        course: course._id,
        status: 'active',
      });
    });

    it('should get paginated enrollments with populated data', async () => {
      const response = await request(app)
        .get('/api/enrollments?page=1&limit=10')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data[0]).toMatchObject({
        student: expect.any(String),
        course: expect.any(String),
        status: 'active',
      });
    });
  });

  describe('POST /api/enrollments', () => {
    it('should create new enrollment with valid data', async () => {
      const response = await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          student: student._id,
          course: course._id,
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toMatchObject({
        student: student._id.toString(),
        course: course._id.toString(),
        status: 'active',
      });

      // Verify student's courses array was updated
      const updatedStudent = await Student.findById(student._id);
      expect(updatedStudent.courses).toContainEqual(course._id);
    });

    it('should reject enrollment without required fields', async () => {
      const response = await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Student ID and Course ID are required',
      );
    });

    it('should reject duplicate enrollment', async () => {
      await Enrollment.create({
        student: student._id,
        course: course._id,
        status: 'active',
      });

      const response = await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          student: student._id,
          course: course._id,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Student is already enrolled in this course',
      );
    });

    it('should reject enrollment with invalid student ID', async () => {
      const response = await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          student: new mongoose.Types.ObjectId(),
          course: course._id,
        });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('No student found with that ID');
    });

    it('should reject enrollment with invalid course ID', async () => {
      const response = await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          student: student._id,
          course: new mongoose.Types.ObjectId(),
        });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('No course found with that ID');
    });
  });

  describe('GET /api/enrollments/student/:studentId', () => {
    beforeEach(async () => {
      await Enrollment.create({
        student: student._id,
        course: course._id,
        status: 'active',
      });
    });

    it('should get student courses with populated data', async () => {
      const response = await request(app)
        .get(`/api/enrollments/student/${student._id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]).toMatchObject({
        name: course.name,
        code: course.code,
        credits: course.credits,
      });
    });

    it('should handle invalid student ID format', async () => {
      const response = await request(app)
        .get('/api/enrollments/student/invalid-id')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/enrollments/course/:courseCode', () => {
    beforeEach(async () => {
      await Enrollment.create({
        student: student._id,
        course: course._id,
        status: 'active',
      });
    });

    it('should allow instructor to get course students with populated data', async () => {
      const response = await request(app)
        .get(`/api/enrollments/course/${course.code}`)
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toMatchObject({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
      });
    });

    it('should prevent student from getting course students', async () => {
      const response = await request(app)
        .get(`/api/enrollments/course/${course.code}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe(
        'You do not have permission to perform this action',
      );
    });

    it('should handle invalid course code', async () => {
      const response = await request(app)
        .get('/api/enrollments/course/invalid-code')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe(
        'No course found with that course code',
      );
    });
  });

  describe('DELETE /api/enrollments/:enrollmentId', () => {
    let existingEnrollment;

    beforeEach(async () => {
      existingEnrollment = await Enrollment.create({
        student: student._id,
        course: course._id,
        status: 'active',
      });

      await Student.findByIdAndUpdate(
        student._id,
        { $push: { courses: course._id } },
        { new: true },
      );
    });

    it('should delete enrollment and update student courses', async () => {
      const response = await request(app)
        .delete(`/api/enrollments/${existingEnrollment._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(204);

      const deleted = await Enrollment.findById(existingEnrollment._id);
      expect(deleted).toBeNull();

      const updatedStudent = await Student.findById(student._id).lean();
      expect(updatedStudent.courses.map((c) => c.toString())).not.toContain(
        course._id.toString(),
      );
    });

    it('should handle invalid enrollment ID', async () => {
      const response = await request(app)
        .delete(`/api/enrollments/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('No enrollment found with that ID');
    });

    it('should handle non-existent student on deletion', async () => {
      await Student.findByIdAndDelete(student._id);

      const response = await request(app)
        .delete(`/api/enrollments/${existingEnrollment._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe(
        'The user belonging to this token does no longer exist.',
      );
    });
  });
});
