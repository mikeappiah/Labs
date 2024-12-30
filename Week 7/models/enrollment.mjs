import mongoose from 'mongoose';
import Student from './student.mjs';
import logger from '../utils/logger.mjs';

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
    required: [true, 'A student id is required'],
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'A course id is required'],
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped'],
    default: 'active',
  },
  grade: {
    type: String,
    default: null,
    enum: ['A', 'B', 'C', 'D', 'E', 'F'],
  },
});

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

/* Add enrolled course to list of student courses */
enrollmentSchema.post('save', async (doc, next) => {
  try {
    await Student.findByIdAndUpdate(
      doc.student,
      { $addToSet: { courses: doc.course } },
      { new: true },
    );
    next();
  } catch (error) {
    logger.error('Error in post save middleware');
    next(error);
  }
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
