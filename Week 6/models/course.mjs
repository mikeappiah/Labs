import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a course name!'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Please enter a course code!'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Please enter a course description!'],
  },
  department: {
    type: String,
    required: [true, 'Please enter a department!'],
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6,
  },
  instructors: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Instructor',
      required: true,
    },
  ],
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
