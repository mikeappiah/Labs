import Instructor from '../models/instructor.mjs';
import asyncHandler from '../utils/asyncHandler.mjs';

export const getAllInstructors = asyncHandler(async (req, res) => {
  const instructors = await Instructor.find();

  res.status(200).json({
    status: 'success',
    results: instructors.length,
    data: {
      data: instructors,
    },
  });
});

export const createInstructor = asyncHandler(async (req, res) => {
  const newInstructor = await Instructor.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      data: newInstructor,
    },
  });
});
