// routes/users.js
const express = require("express");
const router = express.Router();
const { poolPromise } = require("../config/db");

// 所有使用者清單（管理員使用）
router.get("/all", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
      SELECT Id, Username, Role FROM Users
    `);
        res.json(result.recordset);
    } catch (err) {
        console.error("❌ 查詢使用者清單失敗：", err);
        res.status(500).json({ message: "伺服器錯誤" });
    }
});


module.exports = router;
