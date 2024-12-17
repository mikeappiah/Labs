import express from 'express';
import {
  getAllInstructors,
  createInstructor,
} from '../controllers/instructor.mjs';

const router = express.Router();

router.route('/').get(getAllInstructors).post(createInstructor);

export default router;
