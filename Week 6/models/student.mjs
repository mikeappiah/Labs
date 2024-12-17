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
  courses: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
    },
  ],
});

const Student = User.discriminator('Student', studentSchema);

export default Student;
