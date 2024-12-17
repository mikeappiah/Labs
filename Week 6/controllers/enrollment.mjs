import Student from '../models/student.mjs';
import Course from '../models/course.mjs';
import Enrollment from '../models/enrollment.mjs';
import asyncHandler from '../utils/asyncHandler.mjs';
import AppError from '../utils/AppError.mjs';

export const getAllEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find();

  res.status(200).json({
    status: 'success',
    results: enrollments.length,
    data: { data: enrollments },
  });
});

export const createEnrollment = asyncHandler(async (req, res, next) => {
  const { student: studentId, course: courseId } = req.body;

  if (!studentId || !courseId) {
    return next(new AppError('Student ID and Course ID are required', 400));
  }

  const [student, course] = await Promise.all([
    Student.findById(studentId),
    Course.findById(courseId),
  ]);

  if (!student) return next(new AppError('No student found with that ID', 404));
  if (!course) return next(new AppError('No course found with that ID', 404));

  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (existingEnrollment) {
    return next(
      new AppError('Student is already enrolled in this course', 400),
    );
  }

  const newEnrollment = await Enrollment.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { data: newEnrollment },
  });
});

export const getAllStudentCourses = asyncHandler(async (req, res, next) => {
  const enrollments = await Enrollment.find({
    student: req.params.studentId,
  }).populate('course');

  if (!enrollments) {
    return next(new AppError('No enrollment found with that student ID', 404));
  }

  const courses = enrollments.map((enrollment) => enrollment.course);

  res.status(200).json({
    status: 'success',
    data: { data: courses },
  });
});

export const getAllCourseStudents = asyncHandler(async (req, res, next) => {
  const course = await Course.findOne({ code: req.params.courseCode });

  if (!course) {
    return next(new AppError('No course found with that course code', 404));
  }
  const enrollments = await Enrollment.find({
    course: course._id,
  }).populate('student');

  if (!enrollments) {
    return next(new AppError('No enrollment found with that course code', 404));
  }

  const students = enrollments.map((enrollment) => enrollment.student);

  res.status(200).json({
    status: 'success',
    data: { data: students },
  });
});

export const deleteEnrollment = asyncHandler(async (req, res, next) => {
  const enrollment = await Enrollment.findByIdAndDelete(
    req.params.enrollmentId,
  );

  if (!enrollment) {
    return next(new AppError('No enrollment found with that ID'));
  }

  const student = await Student.findById(enrollment.student);

  if (!student) {
    return next(new AppError('No student found with that ID'));
  }

  student.courses = student.courses.filter(
    (courseId) => courseId.toString() !== enrollment.course.toString(),
  );

  await student.save();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
