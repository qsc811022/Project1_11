// 引入 mssql 套件
const sql = require('mssql');

// 資料庫連線設定
const config = {
  user: 'Tedliu',
  password: '1qaz',
  server: 'localhost',         // 或 IP
  database: 'project01',         // 資料庫名稱
  options: {
    encrypt: false,            // 若使用 Azure 要設為 true
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// 建立連線池並匯出
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ MSSQL Connected...');
    return pool;
  })
  .catch(err => console.error('❌ MSSQL 連線失敗', err));

module.exports = {
  sql,
  poolPromise
};
