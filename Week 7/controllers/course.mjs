import Course from '../models/course.mjs';
import AppError from '../utils/AppError.mjs';
import asyncHandler from '../utils/asyncHandler.mjs';

export const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().populate({ path: 'instructors' });

  res.status(200).json({
    status: 'success',
    results: courses.length,
    data: courses,
  });
});

export const getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findOne({ code: req.params.courseCode });

  if (!course) {
    return next(new AppError('No course found with that course code', 404));
  }
  res.status(200).json({
    status: 'success',
    data: course,
  });
});

export const createCourse = asyncHandler(async (req, res) => {
  const newCourse = await Course.create(req.body);

  res.status(201).json({
    status: 'success',
    data: newCourse,
  });
});

export const updateCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findOneAndUpdate(
    { code: req.params.courseCode },
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!course) {
    return next(new AppError('No course found with that course code', 404));
  }

  res.status(200).json({
    status: 'success',
    data: course,
  });
});

export const deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findOneAndDelete({ code: req.params.courseCode });

  if (!course) {
    return next(new AppError('No course found with that course code', 404));
  }

  res.status(204).json({
    staus: 'success',
    data: null,
  });
});
