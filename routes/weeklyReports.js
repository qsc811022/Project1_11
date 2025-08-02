const express = require('express');
const router = express.Router();
const { poolPromise } = require('../config/db');
const jwt = require('jsonwebtoken');

// ✅ 中介函式：驗證 JWT 並附加 userId
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: '缺少 Token' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token 驗證失敗' });
    req.user = decoded;
    next();
  });
}

// ✅ 測試 API
router.get('/test', (req, res) => {
  res.send('✅ weeklyReports API 跑起來了');
});

// ✅ 新增週報 POST
router.post('/', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, text } = req.body;
    const userId = req.user.userId;

    if (!text || !startDate || !endDate) {
      return res.status(400).json({ error: '缺少週報資料' });
    }

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

// ✅ 查詢個人週報 GET /mine
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserId', userId)
      .query(`
        SELECT Id, StartDate, EndDate, ReportText, CreatedAt
        FROM WeeklyReports
        WHERE UserId = @UserId
        ORDER BY CreatedAt DESC
      `);

    res.json(result.recordset);

  } catch (err) {
    console.error('❌ 查詢週報失敗:', err);
    res.status(500).json({ error: '伺服器錯誤，無法查詢週報' });
  }
});

module.exports = router;
