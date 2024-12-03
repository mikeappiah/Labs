const { Pool } = require('pg');

const pool = new Pool({
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
});

module.exports = pool;
