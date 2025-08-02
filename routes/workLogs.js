// routes/workLogs.js
const express = require("express");
const router = express.Router();
const { poolPromise } = require("../config/db");
const jwt = require("jsonwebtoken");

// ✅ 一般使用者驗證中介函式
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

// ✅ 管理者驗證中介函式
function verifyAdmin(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "未提供 Token" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token 無效" });
        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "非管理者，無存取權限" });
        }
        req.user = decoded;
        next();
    });
}

// ✅ 工時新增 API（使用者填寫）
router.post("/", verifyToken, async (req, res) => {
    const { workDate, startTime, endTime, workType, description } = req.body;
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

// ✅ 使用者查詢自己的工時紀錄
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

// ✅ Admin 查詢所有員工工時紀錄
router.get("/admin/all", verifyAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                U.Username, 
                W.WorkDate, 
                W.StartTime, 
                W.EndTime, 
                W.WorkType, 
                W.Description, 
                W.IsOvertime 
            FROM WorkLogs W
            JOIN Users U ON W.UserId = U.Id
            ORDER BY W.WorkDate DESC, W.StartTime
        `);

        res.json(result.recordset);
    } catch (err) {
        console.error("❌ Admin 查詢工時錯誤：", err);
        res.status(500).json({ message: "伺服器錯誤" });
    }
});

module.exports = router;
