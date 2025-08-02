// routes/workLogs.js
const express = require("express");
const router = express.Router();
const { poolPromise } = require("../config/db");
const jwt = require("jsonwebtoken");

// 驗證 JWT 中介函式
function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "未提供 Token" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token 無效" });
        req.user = decoded;
        next();
    });
}

// 🔧 工時新增 API
router.post("/", verifyToken, async (req, res) => {
    const { workDate, startTime, endTime, workType, description } = req.body;

    // 判斷是否為加班（超過 18:00）
    const isOvertime = endTime >= "18:00:00" ? 1 : 0;
    const createdAt = new Date();

    try {
        const pool = await poolPromise;
        await pool.request()
            .input("UserId", req.user.userId)
            .input("WorkDate", workDate)
            .input("StartTime", startTime)
            .input("EndTime", endTime)
            .input("WorkType", workType)
            .input("Description", description)
            .input("IsOvertime", isOvertime)
            .input("CreatedAt", createdAt)
            .query(`
        INSERT INTO WorkLogs 
        (UserId, WorkDate, StartTime, EndTime, WorkType, Description, IsOvertime, CreatedAt)
        VALUES (@UserId, @WorkDate, @StartTime, @EndTime, @WorkType, @Description, @IsOvertime, @CreatedAt)
      `);

        res.json({ message: "✅ 工時已儲存" });
    } catch (err) {
        console.error("❌ 工時寫入錯誤：", err);
        res.status(500).json({ message: "伺服器錯誤" });
    }
});

// ✅ 查詢目前登入者的工時紀錄
router.get("/mine", verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserId", req.user.userId)
            .query(`
        SELECT WorkDate, StartTime, EndTime, WorkType, Description, IsOvertime
        FROM WorkLogs
        WHERE UserId = @UserId
        ORDER BY WorkDate DESC, StartTime
      `);

        res.json(result.recordset);
    } catch (err) {
        console.error("❌ 查詢失敗：", err);
        res.status(500).json({ message: "伺服器錯誤" });
    }
});


module.exports = router;
