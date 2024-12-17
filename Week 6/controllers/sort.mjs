import asyncHandler from '../utils/asyncHandler.mjs';
import quickSort from '../utils/quickSort.mjs';
import Student from '../models/student.mjs';
import Course from '../models/course.mjs';

const sortData = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { field, order = 'asc' } = req.query;
    const data = await Model.find();

    const sortedData = quickSort(data, field, order);

    return res.status(200).json({ field, order, data: sortedData });
  });

export const sortStudents = sortData(Student);
export const sortCourses = sortData(Course);
