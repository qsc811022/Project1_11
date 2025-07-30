const { poolPromise } = require('./db'); // 如果你的 db.js 是在根目錄

async function testConnection() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT GETDATE() AS CurrentTime');
    console.log('✅ 資料庫連線成功！目前時間：', result.recordset[0].CurrentTime);
  } catch (err) {
    console.error('❌ 資料庫連線失敗：', err);
  }
}

testConnection();
