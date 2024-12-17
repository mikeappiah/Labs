import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import logger from './utils/logger.mjs';
import swaggerDocument from './config/swagger.mjs';

import authRouter from './routes/auth.mjs';
import studentRouter from './routes/student.mjs';
import instructorRouter from './routes/instructor.mjs';
import courseRouter from './routes/course.mjs';
import enrollmentRouter from './routes/enrollment.mjs';

import globalErrorHandler from './controllers/error.mjs';
import AppError from './utils/AppError.mjs';

const app = express();

/* connect to local mongodb database */
(async () => {
  try {
    await mongoose.connect(process.env.mongoURI);
    logger.info('Database connection successful');
  } catch (error) {
    logger.error(error.message);
  }
})();

/* middleware */
app.use(express.json());
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { explorer: true }),
);

/* api routes */
app.use('/api/auth', authRouter);
app.use('/api/students', studentRouter);
app.use('/api/instructors', instructorRouter);
app.use('/api/courses', courseRouter);
app.use('/api/enrollments', enrollmentRouter);

/* error handling */
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
