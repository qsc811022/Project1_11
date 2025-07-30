CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,                         -- 使用者編號，主鍵，自動遞增
    Username NVARCHAR(50) NOT NULL UNIQUE,                   -- 使用者帳號，唯一
    PasswordHash NVARCHAR(255) NOT NULL,                     -- 密碼雜湊
    Role NVARCHAR(20) NOT NULL,                              -- 使用者角色（admin/student/employee）
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()            -- 建立時間，預設為現在時間
);

CREATE TABLE WorkLogs (
    Id INT IDENTITY(1,1) PRIMARY KEY,                        -- 工時紀錄編號，主鍵，自動遞增
    UserId INT NOT NULL,                                     -- 使用者編號
    WorkDate DATE NOT NULL,                                  -- 工作日期
    StartTime TIME NOT NULL,                                 -- 開始時間
    EndTime TIME NOT NULL,                                   -- 結束時間
    WorkType NVARCHAR(50) NOT NULL,                          -- 工作類型
    Description NVARCHAR(255),                               -- 工作內容描述（可為 NULL）
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),           -- 建立時間

    FOREIGN KEY (UserId) REFERENCES Users(Id)                -- 關聯到 Users 資料表
);

CREATE TABLE WeeklyReports (
    Id INT IDENTITY(1,1) PRIMARY KEY,                        -- 週報編號，主鍵，自動遞增
    UserId INT NOT NULL,                                     -- 使用者編號
    StartDate DATE NOT NULL,                                 -- 起始日期
    EndDate DATE NOT NULL,                                   -- 結束日期
    ReportText NVARCHAR(MAX) NOT NULL,                       -- 週報內容（支援多行）
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),           -- 建立時間

    FOREIGN KEY (UserId) REFERENCES Users(Id)                -- 關聯到 Users 資料表
);
