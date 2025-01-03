const mockRedisClient = {
  connect: jest.fn(),
  get: jest.fn(),
  setEx: jest.fn(),
  on: jest.fn().mockReturnThis(),
};

const redis = {
  createClient: jest.fn(() => mockRedisClient),
};

export default redis;
