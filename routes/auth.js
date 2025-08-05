// routes/auth.js - 登入註冊路由
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql } = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// 使用者註冊
router.post('/register', async (req, res) => {
    try {
        const { username, password, roleId = 2 } = req.body;
        
        // 檢查使用者是否已存在
        const checkUser = await sql.query`
            SELECT * FROM Users WHERE UserName = ${username}
        `;
        
        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ error: '使用者名稱已存在' });
        }
        
        // 加密密碼
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 插入新使用者
        await sql.query`
            INSERT INTO Users (UserName, PasswordHash, RoleId, CreatedAt)
            VALUES (${username}, ${hashedPassword}, ${roleId}, GETDATE())
        `;
        
        res.status(201).json({ message: '註冊成功' });
    } catch (error) {
        console.error('註冊錯誤:', error);
        res.status(500).json({ error: '伺服器錯誤' });
    }
});

// 使用者登入
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 查找使用者
        const result = await sql.query`
            SELECT u.*, r.RoleName 
            FROM Users u 
            JOIN Roles r ON u.RoleId = r.Id
            WHERE u.UserName = ${username}
        `;
        
        if (result.recordset.length === 0) {
            return res.status(400).json({ error: '使用者名稱或密碼錯誤' });
        }
        
        const user = result.recordset[0];
        
        // 驗證密碼
        const validPassword = await bcrypt.compare(password, user.PasswordHash);
        if (!validPassword) {
            return res.status(400).json({ error: '使用者名稱或密碼錯誤' });
        }
        
        // 建立 JWT token
        const token = jwt.sign(
            { 
                userId: user.Id, 
                username: user.UserName,
                roleId: user.RoleId,
                roleName: user.RoleName
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            token,
            user: {
                id: user.Id,
                username: user.UserName,
                roleId: user.RoleId,
                roleName: user.RoleName
            }
        });
    } catch (error) {
        console.error('登入錯誤:', error);
        res.status(500).json({ error: '伺服器錯誤' });
    }
});

module.exports = router;