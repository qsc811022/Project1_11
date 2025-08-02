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

    // ✅ 正確使用 .env 裡的 JWT_SECRET
    const token = jwt.sign(
      {
        userId: user.Id,
        role: user.Role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: '登入成功', token });

  } catch (err) {
    console.error('❌ 登入失敗:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
