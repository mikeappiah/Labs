import asyncHandler from '../utils/asyncHandler.mjs';
import quickSort from '../utils/quickSort.mjs';
import Student from '../models/student.mjs';
import Course from '../models/course.mjs';
import redisClient from '../config/redisClient.mjs';
import logger from '../utils/logger.mjs';

const sortData = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { field, order = 'asc' } = req.query;

    /* cache key generation */
    const cacheKey = `${Model.modelName}_sorted_${field}_${order}`;
    console.log(cacheKey);

    /* check if sorted data is already cached in redis */
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      logger.info('Cache hit');
      return res.status(200).json(JSON.parse(cachedData));
    }

    logger.info('Cache miss');

    const data = await Model.find();
    const sortedData = quickSort(data, field, order);

    /* cache the sorted data in redis for 1 hour (3600 seconds) */
    const responseData = { field, order, data: sortedData };

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

    return res.status(200).json(responseData);
  });

export const sortStudents = sortData(Student);
export const sortCourses = sortData(Course);
