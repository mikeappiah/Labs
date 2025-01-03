import Instructor from '../models/instructor.mjs';
import asyncHandler from '../utils/asyncHandler.mjs';
import getPagination from '../utils/pagination.mjs';

export const getAllInstructors = asyncHandler(async (req, res, next) => {
  const { skip, limit } = getPagination(req, next);
  const instructors = await Instructor.find().skip(skip).limit(limit);

  res.status(200).json({
    status: 'success',
    results: instructors.length,
    data: instructors,
  });
});

export const createInstructor = asyncHandler(async (req, res) => {
  const newInstructor = await Instructor.create(req.body);

  res.status(201).json({
    status: 'success',
    data: newInstructor,
  });
});
