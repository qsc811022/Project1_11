// gen-password.js
const bcrypt = require('bcrypt');

// 要加密的原始密碼（可替換成你要的）
const plainPassword = 'admin123';

bcrypt.hash(plainPassword, 10)
  .then(hash => {
    console.log(`✅ 密碼 "${plainPassword}" 加密後為：`);
    console.log(hash);
  })
  .catch(err => {
    console.error('❌ 加密失敗:', err);
  });
