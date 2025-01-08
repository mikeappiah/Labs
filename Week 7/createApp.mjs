import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './config/swagger.mjs';
import limiter from './utils/rateLimiter.mjs';

import authRouter from './routes/auth.mjs';
import studentRouter from './routes/student.mjs';
import instructorRouter from './routes/instructor.mjs';
import courseRouter from './routes/course.mjs';
import enrollmentRouter from './routes/enrollment.mjs';
import sortRouter from './routes/sort.mjs';

import globalErrorHandler from './controllers/error.mjs';
import AppError from './utils/AppError.mjs';

function createApp() {
  dotenv.config();
  const app = express();

  /* middleware */
  app.use(express.json());
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, { explorer: true }),
  );
  // security
  app.use(helmet());
  app.use(mongoSanitize());
  app.use('/api', limiter);

  /* api routes */
  app.use('/api/auth', authRouter);
  app.use('/api/students', studentRouter);
  app.use('/api/instructors', instructorRouter);
  app.use('/api/courses', courseRouter);
  app.use('/api/enrollments', enrollmentRouter);
  app.use('/api/sort', sortRouter);

  /* error handling */
  app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
  });

  app.use(globalErrorHandler);

  return app;
}

export default createApp;
