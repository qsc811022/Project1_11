const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { poolPromise } = require('../config/db');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '請輸入帳號與密碼' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('Username', username)
      .query('SELECT * FROM Users WHERE Username = @Username');

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ error: '使用者不存在' });
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ error: '密碼錯誤' });
    }

    const token = jwt.sign(
      {
        userId: user.Id,
        role: user.Role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // ✅ 加上這裡
    res.json({
      message: '登入成功',
      token,
      username: user.Username,
      role: user.Role  // ✅ 加上角色資訊  // ✅ 傳給前端用
    });

  } catch (err) {
    console.error('❌ 登入失敗:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 註冊 API
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const pool = await poolPromise;

    // 1. 檢查帳號是否已存在
    const checkUserResult = await pool.request()
      .input("username", username)
      .query("SELECT * FROM Users WHERE Username = @username");

    if (checkUserResult.recordset.length > 0) {
      return res.status(400).json({ message: "此帳號已被註冊" });
    }

    // 2. 密碼加密
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date();

    // 3. 寫入新使用者
    await pool.request()
      .input("username", username)
      .input("password", hashedPassword)
      .input("role", role)
      .input("createdAt", createdAt)
      .query(`INSERT INTO Users (Username, PasswordHash, Role, CreatedAt)
              VALUES (@username, @password, @role, @createdAt)`);

    res.status(201).json({ message: "註冊成功！" });
  } catch (err) {
    console.error("❌ 註冊錯誤：", err);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});




module.exports = router;
