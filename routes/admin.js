// routes/admin.js - 管理者路由
const express = require('express');
const { sql } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// 所有路由都需要驗證和管理者權限
router.use(authenticateToken);
router.use(isAdmin);

// 獲取所有使用者工時記錄
router.get('/worklogs', async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;
        
        let query = `
            SELECT w.*, u.UserName, wt.TypeName
            FROM WorkLogs w
            JOIN Users u ON w.UserId = u.Id
            JOIN WorkTypes wt ON w.WorkTypeId = wt.Id
        `;
        
        const conditions = [];
        const request = new sql.Request();
        
        if (startDate && endDate) {
            conditions.push('w.WorkDate BETWEEN @startDate AND @endDate');
            request.input('startDate', sql.Date, startDate);
            request.input('endDate', sql.Date, endDate);
        }
        
        if (userId) {
            conditions.push('w.UserId = @userId');
            request.input('userId', sql.Int, userId);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY w.WorkDate DESC, u.UserName';
        
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (error) {
        console.error('管理者獲取工時記錄錯誤:', error);
        res.status(500).json({ error: '伺服器錯誤' });
    }
});

// 獲取所有使用者列表
router.get('/users', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT u.Id, u.UserName, r.RoleName, u.CreatedAt
            FROM Users u
            JOIN Roles r ON u.RoleId = r.Id
            ORDER BY u.UserName
        `;
        res.json(result.recordset);
    } catch (error) {
        console.error('獲取使用者列表錯誤:', error);
        res.status(500).json({ error: '伺服器錯誤' });
    }
});

// 獲取工時統計
router.get('/statistics', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let query = `
            SELECT 
                u.UserName,
                COUNT(w.Id) as TotalDays,
                SUM(DATEDIFF(minute, w.StartTime, w.EndTime)) as TotalMinutes,
                AVG(DATEDIFF(minute, w.StartTime, w.EndTime)) as AvgMinutes
            FROM Users u
            LEFT JOIN WorkLogs w ON u.Id = w.UserId
        `;
        
        const request = new sql.Request();
        
        if (startDate && endDate) {
            query += ' AND w.WorkDate BETWEEN @startDate AND @endDate';
            request.input('startDate', sql.Date, startDate);
            request.input('endDate', sql.Date, endDate);
        }
        
        query += ' GROUP BY u.Id, u.UserName ORDER BY u.UserName';
        
        const result = await request.query(query);
        
        // 轉換分鐘為小時
        const statistics = result.recordset.map(row => ({
            userName: row.UserName,
            totalDays: row.TotalDays || 0,
            totalHours: row.TotalMinutes ? (row.TotalMinutes / 60).toFixed(1) : '0.0',
            avgHours: row.AvgMinutes ? (row.AvgMinutes / 60).toFixed(1) : '0.0'
        }));
        
        res.json(statistics);
    } catch (error) {
        console.error('獲取統計資料錯誤:', error);
        res.status(500).json({ error: '伺服器錯誤' });
    }
});

// 獲取工作類型統計
router.get('/worktype-stats', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let query = `
            SELECT 
                wt.TypeName,
                COUNT(w.Id) as Count,
                SUM(DATEDIFF(minute, w.StartTime, w.EndTime)) as TotalMinutes
            FROM WorkTypes wt
            LEFT JOIN WorkLogs w ON wt.Id = w.WorkTypeId
        `;
        
        const request = new sql.Request();
        
        if (startDate && endDate) {
            query += ' AND w.WorkDate BETWEEN @startDate AND @endDate';
            request.input('startDate', sql.Date, startDate);
            request.input('endDate', sql.Date, endDate);
        }
        
        query += ' GROUP BY wt.Id, wt.TypeName ORDER BY TotalMinutes DESC';
        
        const result = await request.query(query);
        
        const stats = result.recordset.map(row => ({
            typeName: row.TypeName,
            count: row.Count || 0,
            totalHours: row.TotalMinutes ? (row.TotalMinutes / 60).toFixed(1) : '0.0'
        }));
        
        res.json(stats);
    } catch (error) {
        console.error('獲取工作類型統計錯誤:', error);
        res.status(500).json({ error: '伺服器錯誤' });
    }
});

module.exports = router;