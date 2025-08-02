// routes/weeklyReports.js
const express = require('express');
const router = express.Router();
const { poolPromise } = require('../config/db');
const jwt = require('jsonwebtoken'); // 若尚未引入，記得安裝與引入

// // 🔧 測試 API：確認是否運作
// router.get('/test', (req, res) => {
//   res.send('✅ weeklyReports API 跑起來了');
// });

// ✅ 新增週報 POST API
router.post('/', async (req, res) => {
  try {
    // 解析 JWT：從 Header 中抓出 Bearer token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: '未授權，缺少 Token' });
    }

    // 驗證並解析 token，這裡用 JWT_SECRET 驗證
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // 從前端取得週報內容與起訖日期
    const { startDate, endDate, text } = req.body;

    if (!text || !startDate || !endDate) {
      return res.status(400).json({ error: '缺少週報資料' });
    }

    // 寫入 MSSQL 資料庫
    const pool = await poolPromise;
    await pool.request()
      .input('UserId', userId)
      .input('StartDate', startDate)
      .input('EndDate', endDate)
      .input('ReportText', text)
      .query(`
        INSERT INTO WeeklyReports (UserId, StartDate, EndDate, ReportText)
        VALUES (@UserId, @StartDate, @EndDate, @ReportText)
      `);

    res.status(201).json({ message: '✅ 週報已成功儲存' });

  } catch (err) {
    console.error('❌ 儲存週報失敗:', err);
    res.status(500).json({ error: '伺服器錯誤，儲存週報失敗' });
  }
});

module.exports = router;
