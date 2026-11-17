const { Pool, types } = require('pg');
require('dotenv').config();

// Convierte columnas NUMERIC/DECIMAL (OID 1700) de PostgreSQL a float nativo de JS
types.setTypeParser(1700, (val) => parseFloat(val));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;
