import express from 'express';
import {
  getAllStudents,
  createStudent,
  getStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/student.mjs';

const router = express.Router();

router.route('/').get(getAllStudents).post(createStudent);

router.route('/:id').get(getStudent).patch(updateStudent).delete(deleteStudent);

export default router;
