// gen-password.js
const bcrypt = require('bcrypt');

// 要加密的原始密碼（可替換成你要的）
//account test01
// 密碼：admin123
// 加密後的密碼：$2b$10$1ccgRQCnvD8Ak.oG/v0HHOMYJDTP2Naa1.vLxt5UPO80tYj2x.ukK
// 這個加密後的密碼可以直接用於資料庫中，並在登入時進行比對。
const plainPassword = 'admin123';
//$2b$10$1ccgRQCnvD8Ak.oG/v0HHOMYJDTP2Naa1.vLxt5UPO80tYj2x.ukK

bcrypt.hash(plainPassword, 10)
  .then(hash => {
    console.log(`✅ 密碼 "${plainPassword}" 加密後為：`);
    console.log(hash);
  })
  .catch(err => {
    console.error('❌ 加密失敗:', err);
  });
