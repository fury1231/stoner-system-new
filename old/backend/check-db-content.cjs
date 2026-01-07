const Database = require('better-sqlite3');
const db = new Database('/var/www/stoner-system/backend/data/database.sqlite', { readonly: true });

console.log('\n📊 資料庫內容檢查\n');
console.log('='.repeat(70));

// 檢查所有表的記錄數
const tables = ['stores', 'payments', 'users', 'audit_logs'];

tables.forEach(table => {
  try {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
    console.log(`${table}: ${count.count} 筆記錄`);
  } catch (e) {
    console.log(`${table}: 表不存在或錯誤`);
  }
});

// 檢查 payments 表的狀態欄位
console.log('\n\n📋 Payments 表狀態分布:\n');
try {
  const statusDist = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM payments
    GROUP BY status
  `).all();

  statusDist.forEach(s => {
    console.log(`   ${s.status}: ${s.count} 筆`);
  });
} catch (e) {
  console.log('無法查詢狀態分布');
}

// 檢查前 10 筆記錄
console.log('\n\n🔍 前 10 筆 Payments 記錄:\n');
try {
  const records = db.prepare(`
    SELECT uuid, payment_method, amount, status, store_id, paid_at
    FROM payments
    ORDER BY created_at DESC
    LIMIT 10
  `).all();

  records.forEach(r => {
    console.log(`   ${r.uuid.substring(0, 8)} | ${r.payment_method} | $${r.amount} | ${r.status} | 店:${r.store_id}`);
  });
} catch (e) {
  console.log('無法查詢記錄:', e.message);
}

console.log('\n' + '='.repeat(70) + '\n');

db.close();
