import express from 'express';
import {
  createEnrollment,
  deleteEnrollment,
  getAllCourseStudents,
  getAllEnrollments,
  getAllStudentCourses,
} from '../controllers/enrollment.mjs';

import protectRoute from '../middlewares/protectRoute.mjs';
import restrictTo from '../middlewares/restrictTo.mjs';

const router = express.Router();

router.use(protectRoute);

router.route('/').get(getAllEnrollments).post(createEnrollment);
router.get('/student/:studentId', getAllStudentCourses);
router.get(
  '/course/:courseCode',
  restrictTo('Instructor'),
  getAllCourseStudents,
);
router.delete('/:enrollmentId', deleteEnrollment);

export default router;
