import Student from '../models/student.mjs';
import asyncHandler from '../utils/asyncHandler.mjs';
import AppError from '../utils/AppError.mjs';
import getPagination from '../utils/pagination.mjs';

export const getAllStudents = asyncHandler(async (req, res) => {
  const { skip, limit } = getPagination(req, next);

  const students = await Student.find().skip(skip).limit(limit);

  res.status(200).json({
    status: 'success',
    results: students.length,
    data: students,
  });
});

export const getStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(new AppError('No student found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: student,
  });
});

export const createStudent = asyncHandler(async (req, res) => {
  const newStudent = await Student.create(req.body);

  res.status(201).json({
    status: 'success',
    data: newStudent,
  });
});

export const updateStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!student) {
    return next(new AppError('No student found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: student,
  });
});

export const deleteStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findByIdAndDelete(req.params.id);

  if (!student) {
    return next(new AppError('No student found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
