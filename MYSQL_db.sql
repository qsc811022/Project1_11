-- ===============================
-- 1. 使用者角色表：Roles
-- ===============================
CREATE TABLE Roles (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    RoleName VARCHAR(20) NOT NULL UNIQUE
);

-- 預設角色資料
INSERT INTO Roles (RoleName)
VALUES ('admin'), ('student'), ('employee');

-- ===============================
-- 2. 使用者表：Users
-- ===============================
CREATE TABLE Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserName VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    RoleId INT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (RoleId) REFERENCES Roles(Id)
);

-- ===============================
-- 3. 工作類型表：WorkTypes
-- ===============================
CREATE TABLE WorkTypes (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TypeName VARCHAR(50) NOT NULL UNIQUE
);

-- 預設工作類型資料
INSERT INTO WorkTypes (TypeName)
VALUES ('Meeting'), ('Coding'), ('Code Review'), ('Document'), ('Testing'), ('Support');

-- ===============================
-- 4. 每日工時紀錄表：WorkLogs
-- ===============================
CREATE TABLE WorkLogs (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    WorkDate DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    WorkTypeId INT NOT NULL,
    Description VARCHAR(255),
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (WorkTypeId) REFERENCES WorkTypes(Id)
);
