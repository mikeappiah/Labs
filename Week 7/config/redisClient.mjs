import redis from 'redis';
import logger from '../utils/logger.mjs';

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient
  .on('connect', () => logger.info('Connected to Redis'))
  .on('error', (err) => logger.error('Redis connection error'));

redisClient.connect();

export default redisClient;
