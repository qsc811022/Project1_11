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

router.get('/mine', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { start, end } = req.query;

    let sql = `
      SELECT Id, StartDate, EndDate, ReportText, CreatedAt
      FROM WeeklyReports
      WHERE UserId = @UserId
    `;
    const pool = await poolPromise;
    const request = pool.request().input("UserId", userId);

    if (start) {
      sql += ` AND StartDate >= @StartDate`;
      request.input("StartDate", start);
    }
    if (end) {
      sql += ` AND EndDate <= @EndDate`;
      request.input("EndDate", end);
    }

    sql += ` ORDER BY StartDate DESC`;

    const result = await request.query(sql);
    res.json(result.recordset);

  } catch (err) {
    console.error('❌ 篩選週報失敗:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});
// routes/workLogs.js（新增這段）
router.get("/byUser/:userId", verifyToken, async (req, res) => {
  const userId = req.params.userId;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("UserId", userId)
      .query(`
                SELECT w.WorkDate, w.StartTime, w.EndTime, w.WorkType, w.Description, w.IsOvertime, u.Username
                FROM WorkLogs w
                JOIN Users u ON w.UserId = u.Id
                WHERE w.UserId = @UserId
                ORDER BY w.WorkDate DESC, w.StartTime
            `);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ 查詢工時失敗：", err);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});

// ✅ 後端 API：管理者查詢所有使用者工時紀錄
router.get("/admin/all", verifyToken, async (req, res) => {
  const { userId, startDate, endDate } = req.query;

  try {
    const pool = await poolPromise;
    const request = pool.request();

    console.log("🔍 後端收到條件：", { userId, startDate, endDate });

    let sqlQuery = `
      SELECT w.WorkDate, w.StartTime, w.EndTime, w.WorkType, w.Description, w.IsOvertime, u.Username
      FROM WorkLogs w
      JOIN Users u ON w.UserId = u.Id
      WHERE 1=1
    `;

    if (userId) {
      console.log("🧪 篩選 UserId =", userId);
      sqlQuery += ` AND w.UserId = @UserId`;
      request.input("UserId", sql.Int, Number(userId)); // <--- ✅ 建議改成 Number
    }

    if (startDate) {
      sqlQuery += ` AND CONVERT(date, w.WorkDate) >= @StartDate`;
      request.input("StartDate", sql.Date, new Date(startDate));
    }

    if (endDate) {
      sqlQuery += ` AND CONVERT(date, w.WorkDate) <= @EndDate`;
      request.input("EndDate", sql.Date, new Date(endDate));
    }

    sqlQuery += ` ORDER BY w.WorkDate DESC, w.StartTime`;

    console.log("📄 最終 SQL 查詢語法：", sqlQuery);

    const result = await request.query(sqlQuery);

    console.log("✅ 回傳筆數：", result.recordset.length);
    console.table(result.recordset);

    res.json(result.recordset);

  } catch (err) {
    console.error("❌ 管理者查詢失敗：", err);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});


module.exports = router;
