import mongoose from 'mongoose';
import validator from 'validator';
import User from './user.mjs';
import regexPatterns from '../utils/regexPatterns.mjs';

const instructorSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    validate: {
      validator: (value) =>
        validator.matches(value, regexPatterns.instructorEmailPattern),
      message: (props) => `${props.value} is not a valid staff email!`,
    },
  },
  department: {
    type: String,
    required: true,
  },
});

const Instructor = User.discriminator('Instructor', instructorSchema);

export default Instructor;
