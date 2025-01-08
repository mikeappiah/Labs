import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import createApp from '../createApp.mjs';
import User from '../models/user.mjs';
import Student from '../models/student.mjs';
import Instructor from '../models/instructor.mjs';
import Course from '../models/course.mjs';
import { signToken } from '../controllers/auth.mjs';

jest.mock('../config/swagger.mjs', () => ({
  default: {},
}));

let app;
let mongoServer;

describe('Course Integration Tests', () => {
  let student;
  let instructor;
  let course;
  let studentToken;
  let instructorToken;

  const testInstructor = {
    firstName: 'John',
    lastName: 'Doe',
    password: 'Test1234!',
    dateOfBirth: '1980-01-01',
    phoneNumber: 'XXXX',
    email: 'johndoe@staff.university.edu',
    department: 'Computer Science',
  };

  const testStudent = {
    firstName: 'Cole',
    lastName: 'Palmer',
    password: 'Test5678!',
    dateOfBirth: '2000-01-01',
    phoneNumber: 'XXXXX',
    email: 'colepalmer@st.university.edu',
    grade: '2nd Year',
    gpa: 3.5,
  };

  const testCourse = {
    name: 'Linear Algebra for Engineers',
    code: 'math102',
    description:
      'Explores linear equations, matrices, vector spaces, and eigenvalues with practical applications in engineering.',
    department: 'Mathematics',
    credits: 3,
    instructors: [],
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
    await Instructor.deleteMany({});
    await Course.deleteMany({});

    student = await Student.create(testStudent);
    instructor = await Instructor.create(testInstructor);
    course = await Course.create(testCourse);

    studentToken = signToken({
      id: student._id,
      email: student.email,
    });
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
      const response = await request(app).get('/api/courses');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        'You are not logged in! Please log in to get access.',
      );
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('jwt malformed');
    });
  });

  describe('GET /api/courses', () => {
    it('should get paginated courses with populated data when authenticated', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]).toMatchObject({
        name: course.name,
        code: course.code.toLowerCase(),
        description: course.description,
        department: course.department,
        credits: course.credits,
      });
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/courses');
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe(
        'You are not logged in! Please log in to get access.',
      );
    });
  });

  describe('POST /api/courses', () => {
    it('should create course when instructor is authenticated', async () => {
      const newCourse = {
        name: 'New Course',
        code: 'newCourse101',
        description: 'This is a new course',
        department: 'New Course Department',
        credits: 3,
        instructors: [],
      };
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(newCourse);

      expect(response.status).toBe(201);
      expect(response.body.data).toMatchObject({
        name: newCourse.name,
        code: newCourse.code.toLowerCase(),
        description: newCourse.description,
        department: newCourse.department,
        credits: newCourse.credits,
      });
    });

    it('should return 403 when non-instructor tries to create course', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(course);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe(
        'You do not have permission to perform this action',
      );
    });
  });

  describe('GET /api/courses/:courseCode', () => {
    it('should get specific course when authenticated', async () => {
      const response = await request(app)
        .get(`/api/courses/${course.code}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        name: course.name,
        code: course.code.toLowerCase(),
        description: course.description,
        department: course.department,
        credits: course.credits,
      });
    });

    it('should return 404 for non-existent course', async () => {
      const response = await request(app)
        .get('/api/courses/nonexistent123')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe(
        'No course found with that course code',
      );
    });
  });

  describe('PATCH /api/courses/:courseCode', () => {
    it('should update course when instructor is authenticated', async () => {
      const response = await request(app)
        .patch(`/api/courses/${course.code}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({ name: 'Updated Course Name' });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated Course Name');
    });

    it('should return 403 when student tries to update course', async () => {
      const response = await request(app)
        .patch(`/api/courses/${course.code}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ name: 'Updated Course Name' });

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe(
        'You do not have permission to perform this action',
      );
    });

    it('should return 404 for non-existent course', async () => {
      const response = await request(app)
        .patch('/api/courses/nonexistent123')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({ name: 'Updated Course Name' });

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe(
        'No course found with that course code',
      );
    });
  });

  describe('DELETE /api/courses/:courseCode', () => {
    it('should delete course when instructor is authenticated', async () => {
      const response = await request(app)
        .delete(`/api/courses/${course.code}`)
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(response.status).toBe(204);
    });
  });
});
