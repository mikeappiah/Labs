import express from 'express';
import {
  getAllCourses,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/course.mjs';

const router = express.Router();

router.route('/').get(getAllCourses).post(createCourse);

router
  .route('/:courseCode')
  .get(getCourse)
  .patch(updateCourse)
  .delete(deleteCourse);

export default router;
