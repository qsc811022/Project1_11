// middleware/auth.js - JWT 驗證中介軟體
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: '需要登入權限' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: '無效的token' });
        }
        req.user = user;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user.roleId !== 1) {
        return res.status(403).json({ error: '需要管理者權限' });
    }
    next();
};

module.exports = {
    authenticateToken,
    isAdmin,
    JWT_SECRET
};