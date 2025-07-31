const express = require('express');
const cors = require('cors');
const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 正確掛載 router
const weeklyReportsRouter = require('./routes/weeklyReports');
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);
app.use('/api/weeklyReports', weeklyReportsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
