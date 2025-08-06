// server.js - 主要伺服器檔案
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中介軟體
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 連接資料庫
connectDB();

// 路由
// 提供靜態檔案
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`伺服器運行於 http://localhost:${PORT}`);
});