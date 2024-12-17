import express from 'express';
import {
  getAllCourses,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/course.mjs';

import protectRoute from '../middlewares/protectRoute.mjs';
import restrictTo from '../middlewares/restrictTo.mjs';

const router = express.Router();

router.use(protectRoute);

router
  .route('/')
  .get(getAllCourses)
  .post(restrictTo('Instructor'), createCourse);

router
  .route('/:courseCode')
  .get(getCourse)
  .patch(restrictTo('Instructor'), updateCourse)
  .delete(restrictTo('Instructor'), deleteCourse);

export default router;
