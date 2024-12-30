import express from 'express';
import { sortCourses, sortStudents } from '../controllers/sort.mjs';

const router = express.Router();

router.get('/students', sortStudents);
router.get('/courses', sortCourses);

export default router;
