import express from 'express';
import {
  createEnrollment,
  deleteEnrollment,
  getAllCourseStudents,
  getAllEnrollments,
  getAllStudentCourses,
} from '../controllers/enrollment.mjs';

const router = express.Router();

router.route('/').get(getAllEnrollments).post(createEnrollment);
router.get('/student/:studentId', getAllStudentCourses);
router.get('/course/:courseCode', getAllCourseStudents);
router.delete('/:enrollmentId', deleteEnrollment);

export default router;
