const express = require('express');
const router = express.Router();

// 測試路由
router.get('/test', (req, res) => {
  res.send('✅ weeklyReports API 跑起來了');
});

module.exports = router;