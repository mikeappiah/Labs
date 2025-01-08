import mongoose from 'mongoose';
import logger from './utils/logger.mjs';
import createApp from './createApp.mjs';

const app = createApp();

/* connect to local mongodb database */
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Database connection successful');
  } catch (error) {
    logger.error(error.message);
  }
})();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
