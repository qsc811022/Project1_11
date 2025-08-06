const db = require('../config/db');
const mssql = require('mssql');

async function query(sqlText, params = {}) {
  if (process.env.DB_TYPE === 'mssql') {
    const pool = await db;
    let request = pool.request();
    for (let key in params) {
      request = request.input(key, params[key]);
    }
    const result = await request.query(sqlText);
    return result.recordset;
  } else if (process.env.DB_TYPE === 'mysql') {
    const conn = await db;
    const values = Object.values(params);
    const [rows] = await conn.execute(sqlText, values);
    return rows;
  }
}

module.exports = { query };
