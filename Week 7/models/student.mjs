import mongoose from 'mongoose';
import validator from 'validator';
import User from './user.mjs';
import regexPatterns from '../utils/regexPatterns.mjs';

const studentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value) =>
        validator.matches(value, regexPatterns.studentEmailPattern),
      message: (props) => `${props.value} is not a valid student email!`,
    },
  },
  grade: {
    type: String,
    required: [true, 'A student must have a grade'],
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
  },
  gpa: {
    type: Number,
    min: [1.0, 'gpa must be 1.0 or above'],
    max: [4.0, 'gpa must be 4.0 or below'],
    default: 1.0,
  },
  courses: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
    },
  ],
});

studentSchema.index({ gpa: 1 });
studentSchema.index({ grade: 1 });

const Student = User.discriminator('Student', studentSchema);

export default Student;
