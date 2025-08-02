// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { poolPromise } = require('../config/db');

// JWT 簽名密鑰（正式環境請用 .env 管理）
const JWT_SECRET = 'your_secret_key';

// 登入 API
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 檢查是否有輸入帳密
    if (!username || !password) {
      return res.status(400).json({ error: '請輸入帳號與密碼' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('Username', username)
      .query('SELECT * FROM Users WHERE Username = @Username');

    const user = result.recordset[0];

    // 使用者不存在
    if (!user) {
      return res.status(401).json({ error: '使用者不存在' });
    }

    // Debug 輸出密碼比對前的內容
    console.log('🔐 輸入密碼:', password);
    console.log('🔑 資料庫密碼雜湊:', user.PasswordHash);

    // 驗證密碼
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ error: '密碼錯誤' });
    }

    // 密碼正確，產生 JWT
    const token = jwt.sign(
      {
        userId: user.Id,
        role: user.Role
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: '登入成功', token });

  } catch (err) {
    console.error('❌ 登入失敗:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
