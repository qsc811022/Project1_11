const express = require('express');
const cors = require('cors');
const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 正確掛載 router
const weeklyReportsRouter = require('./routes/weeklyReports');
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/api/weeklyReports', weeklyReportsRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

const path = require('path');
app.use(express.static(path.join(__dirname, 'public'))); // 如果 login.html 放在 public 資料夾
