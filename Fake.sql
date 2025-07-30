INSERT INTO Users (Username, PasswordHash, Role)
VALUES 
  ('admin01', 'hashedpassword123', 'admin'),
  ('student01', 'hashedpassword456', 'student'),
  ('employee01', 'hashedpassword789', 'employee');


-- admin01 的工作紀錄
INSERT INTO WorkLogs (UserId, WorkDate, StartTime, EndTime, WorkType, Description)
VALUES 
  (1, '2025-07-01', '09:00', '12:00', '會議', '與團隊會議討論架構'),
  (1, '2025-07-01', '13:30', '18:00', '開發', '開發登入模組');

-- student01 的工作紀錄
INSERT INTO WorkLogs (UserId, WorkDate, StartTime, EndTime, WorkType, Description)
VALUES 
  (2, '2025-07-01', '10:00', '12:00', '自學', '學習 JavaScript'),
  (2, '2025-07-01', '14:00', '17:00', '練習', 'Vue.js ToDoList 練習');

-- employee01 的工作紀錄
INSERT INTO WorkLogs (UserId, WorkDate, StartTime, EndTime, WorkType, Description)
VALUES 
  (3, '2025-07-01', '08:30', '12:00', '測試', '測試週報 PDF 匯出功能'),
  (3, '2025-07-01', '13:00', '17:30', '文件', '撰寫系統文件');


-- admin01 的週報
INSERT INTO WeeklyReports (UserId, StartDate, EndDate, ReportText)
VALUES 
(1, '2025-07-01', '2025-07-05', N'
📋 本週工作摘要：

🟢 週一：團隊會議，確認開發排程
🟢 週二：完成後台權限模組
🟢 週三：整合前後端登入邏輯
🟢 週四：開發週報匯出功能
🟢 週五：簡報準備與測試');

-- student01 的週報
INSERT INTO WeeklyReports (UserId, StartDate, EndDate, ReportText)
VALUES 
(2, '2025-07-01', '2025-07-05', N'
📋 本週學習摘要：

✅ JavaScript 基礎語法
✅ Vue 元件與 Props 練習
✅ 撰寫個人作品首頁
✅ 了解 RESTful API 概念
✅ 完成 ToDoList 小專案');

-- employee01 的週報
INSERT INTO WeeklyReports (UserId, StartDate, EndDate, ReportText)
VALUES 
(3, '2025-07-01', '2025-07-05', N'
📋 本週工程工作：

✅ 伺服器部署環境確認
✅ 修復工時記錄邏輯錯誤
✅ 撰寫 API 文件
✅ 修正週報頁面 RWD
✅ 完成 PDF 輸出模組');
