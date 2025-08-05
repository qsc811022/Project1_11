// routes/worklogs.js - 工時記錄路由
const express = require('express');
const { sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 所有路由都需要驗證
router.use(authenticateToken);

// 新增工時記錄
router.post('/', async (req, res) => {
    try {
        const { workDate, startTime, endTime, workTypeId, description } = req.body;
        const userId = req.user.userId;
        
        // 檢查是否已有當日記錄
        const existingLog = await sql.query`
            SELECT * FROM WorkLogs 
            WHERE UserId = ${userId} AND WorkDate = ${workDate}
        `;
        
        if (existingLog.recordset.length > 0) {
            return res.status(400).json({ error: '該日期已有工時記錄' });
        }
        
        await sql.query`
            INSERT INTO WorkLogs (UserId, WorkDate, StartTime, EndTime, WorkTypeId, Description, CreatedAt)
            VALUES (${userId}, ${workDate}, ${startTime}, ${endTime}, ${workTypeId}, ${description}, GETDATE())
        `;
        
        res.status(201).json({ message: '工時記錄新增成功' });
    } catch (error) {
        console.error('新增工時錯誤:', error);
        res.status(500).json({ error: '伺服器錯誤' });
    }
});

// 獲取使用者工時記錄
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { startDate, endDate, limit = 10 } = req.query;
        
        let query = `
            SELECT w.*, wt.TypeName
            FROM WorkLogs w
            JOIN WorkTypes wt ON w.WorkTypeId = wt.Id
            WHERE w.UserId = @userId
        `;
        
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);
        
        if (startDate && endDate) {
            query += ' AND w.WorkDate BETWEEN @startDate AND @endDate';
            request.input('startDate', sql.Date, startDate);
            request.input('endDate', sql.Date, endDate);
        }
        
        query += ` ORDER BY w.WorkDate DESC`;
        
        if (!startDate && !endDate) {
            query += ` OFFSET 0 ROWS FETCH NEXT ${parseInt(limit)} ROWS ONLY`;
        }
        
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (error) {
        console.error('獲取工時記錄錯誤:', error);
        res.status(500).json({ error: '伺服器錯誤' });
    }
});

// 獲取工作類型
router.get('/types', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM WorkTypes ORDER BY TypeName`;
        res.json(result.recordset);
    } catch (error) {
        console.error('獲取工作類型錯誤:', error);
        res.status(500).json({ error: '伺服器錯誤' });
    }
});

// 獲取週報數據
router.get('/weekly', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { weekStart } = req.query;
        
        if (!weekStart) {
            return res.status(400).json({ error: '請提供週開始日期' });
        }
        
        // 計算週結束日期
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const result = await sql.query`
            SELECT w.*, wt.TypeName
            FROM WorkLogs w
            JOIN WorkTypes wt ON w.WorkTypeId = wt.Id
            WHERE w.UserId = ${userId}
            AND w.WorkDate BETWEEN ${weekStart} AND ${weekEnd.toISOString().split('T')[0]}
            ORDER BY w.WorkDate
        `;
        
        res.json(result.recordset);
    } catch (error) {
        console.error('獲取週報錯誤:', error);
        res.status(500).json({ error: '伺服器錯誤' });
    }
});

// 更新工時記錄
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { workDate, startTime, endTime, workTypeId, description } = req.body;
        const userId = req.user.userId;
        
        // 檢查記錄是否屬於當前使用者
        const checkOwner = await sql.query`
            SELECT * FROM WorkLogs WHERE Id = ${id} AND UserId = ${userId}
        `;
        
        if (checkOwner.recordset.length === 0) {
            return res.status(404).json({ error: '找不到該記錄或無權限修改' });
        }
        
        await sql.query`
            UPDATE WorkLogs 
            SET WorkDate = ${workDate}, StartTime = ${startTime}, EndTime = ${endTime}, 
                WorkTypeId = ${workTypeId}, Description = ${description}
            WHERE Id = ${id} AND UserId = ${userId}
        `;
        
        res.json({ message: '工時記錄更新成功' });
    } catch (error) {
        console.error('更新工時記錄錯誤:', error);
        res.status(500).json({ error: '伺服器錯誤' });
    }
});

// 刪除工時記錄
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        
        const result = await sql.query`
            DELETE FROM WorkLogs WHERE Id = ${id} AND UserId = ${userId}
        `;
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: '找不到該記錄或無權限刪除' });
        }
        
        res.json({ message: '工時記錄刪除成功' });
    } catch (error) {
        console.error('刪除工時記錄錯誤:', error);
        res.status(500).json({ error: '伺服器錯誤' });
    }
});

module.exports = router;
