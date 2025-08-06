require('dotenv').config();
const mssql = require('mssql');
const mysql = require('mysql2/promise');


let db;

if (process.env.DB_TYPE === 'mssql') {
  db = mssql.connect({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  });
} else if (process.env.DB_TYPE === 'mysql') {
  db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });
} else {
  throw new Error('Unsupported DB_TYPE');
}

module.exports = db;
