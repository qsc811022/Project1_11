// testDb.js
require('dotenv').config(); // ✅ 載入 .env
const db = require('./config/db'); // ✅ 使用你的 MySQL 連線池

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT NOW() AS now');
    console.log('✅ 資料庫連線成功！現在時間：', rows[0].now);
  } catch (err) {
    console.error('❌ 資料庫連線失敗：', err);
  }
}

testConnection();
