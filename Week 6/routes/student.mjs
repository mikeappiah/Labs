import express from 'express';
import {
  getAllStudents,
  createStudent,
  getStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/student.mjs';

import protectRoute from '../middlewares/protectRoute.mjs';
import restrictTo from '../middlewares/restrictTo.mjs';

const router = express.Router();

router
  .route('/')
  .get(protectRoute, restrictTo('Instructor'), getAllStudents)
  .post(protectRoute, restrictTo('Instructor'), createStudent);

router
  .route('/:id')
  .get(getStudent)
  .patch(updateStudent)
  .delete(protectRoute, restrictTo('Instructor'), deleteStudent);

export default router;
