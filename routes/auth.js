// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // ✅ 正確

// ✅ 登入 API
router.post('/login', async (req, res) => {
  const { UserName, Password } = req.body;

  try {
    // 📌 查詢資料庫：依使用者名稱找使用者資訊
    const rows = await db.query(
      `SELECT Users.Id, Users.PasswordHash, Roles.RoleName
       FROM Users
       JOIN Roles ON Users.RoleId = Roles.Id
       WHERE UserName = @UserName`,
      { UserName }
    );

    // ❗ 沒有這個帳號
    if (rows.length === 0) {
      return res.status(401).json({ message: '帳號錯誤' });
    }

    const user = rows[0];

    // ❗ 密碼錯誤
    const match = await bcrypt.compare(Password, user.PasswordHash);
    if (!match) {
      return res.status(401).json({ message: '密碼錯誤' });
    }

    // ✅ 產生 JWT Token
    const token = jwt.sign(
      { userId: user.Id, role: user.RoleName },
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    );

    // ✅ 回傳 Token 與 Role
    res.json({ token, role: user.RoleName });

  } catch (err) {
    console.error('登入失敗:', err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

module.exports = router;
