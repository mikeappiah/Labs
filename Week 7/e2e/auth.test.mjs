import createApp from '../createApp.mjs';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/user.mjs';
import Student from '../models/student.mjs';

jest.mock('../config/swagger.mjs', () => ({
  default: {},
}));

let app;
let mongoServer;

describe('Auth Integration Tests', () => {
  let student;
  const testUser = {
    firstName: 'Michael',
    lastName: 'Appiah',
    password: 'Str0ngP@ssword123!',
    dateOfBirth: '2002-10-20',
    phoneNumber: '0207171866',
    grade: '2nd Year',
    gpa: 3.4,
    email: 'mkappiah@st.university.edu',
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
    student = await Student.create(testUser);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    delete process.env.NODE_ENV;
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBeDefined();
      expect(response.body.data.password).toBeUndefined();
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Incorrect email or password');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@st.university.edu',
        password: testUser.password,
      });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Incorrect email or password');
    });

    it('should fail with missing credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Please provide email and password!');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send reset token for valid email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('/api/auth/password-reset/');

      // Verify that reset token was saved
      const updatedUser = await User.findById(student._id);
      expect(updatedUser.passwordResetToken).toBeDefined();
      expect(updatedUser.passwordResetExpires).toBeDefined();
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@st.university.edu',
        });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe(
        'There is no user with email address.',
      );
    });
  });

  describe('PATCH /api/auth/password-reset/:token', () => {
    let resetToken;

    beforeEach(async () => {
      // Create reset token
      resetToken = student.createPasswordResetToken();

      // Save the student with the new token
      try {
        await student.save({ validateBeforeSave: false });

        // Verify token was saved correctly
        const savedStudent = await User.findById(student._id);
      } catch (err) {
        console.error('Error saving reset token:', err);
      }
    });

    it('should reset password with valid token', async () => {
      const newPassword = 'NewTestP@ssw0rd123!';

      const response = await request(app)
        .patch(`/api/auth/password-reset/${resetToken}`)
        .send({
          password: newPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();

      // Verify password was changed correctly
      const updatedUser = await User.findById(student._id).select('+password');
      const isNewPasswordCorrect = await bcrypt.compare(
        newPassword,
        updatedUser.password,
      );
      expect(isNewPasswordCorrect).toBe(true);
      expect(updatedUser.passwordResetToken).toBeUndefined();
      expect(updatedUser.passwordResetExpires).toBeUndefined();
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .patch('/api/auth/password-reset/invalidtoken')
        .send({
          password: 'NewTestP@ssw0rd123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Token is invalid or has expired');
    });

    it('should fail with expired token', async () => {
      await User.findByIdAndUpdate(student._id, {
        passwordResetExpires: Date.now() - 1000,
      });

      const response = await request(app)
        .patch(`/api/auth/password-reset/${resetToken}`)
        .send({
          password: 'NewTestP@ssw0rd123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Token is invalid or has expired');
    });
  });
});
