const Database = require('better-sqlite3');
const db = new Database('./data/database.db', { readonly: true });

console.log('\n🔍 調查 FC420 在 12/10 的數據\n');
console.log('='.repeat(70));

// 1. 檢查 FC420 是什麼
console.log('\n1️⃣  檢查 FC420...');
const stores = db.prepare('SELECT * FROM stores WHERE code LIKE ? OR name LIKE ?').all('%FC420%', '%FC420%');
const users = db.prepare('SELECT id, username FROM users WHERE username LIKE ?').all('%FC420%');

if (stores.length > 0) {
  console.log('   FC420 是分店:');
  stores.forEach(s => console.log(`   - ID: ${s.id}, 名稱: ${s.name}, 代碼: ${s.code}`));
}

if (users.length > 0) {
  console.log('   FC420 是用戶:');
  users.forEach(u => console.log(`   - ID: ${u.id}, 用戶名: ${u.username}`));
}

// 2. 檢查所有分店
console.log('\n2️⃣  所有分店列表:');
const allStores = db.prepare('SELECT id, name, code FROM stores').all();
allStores.forEach(s => {
  const code = s.code || '無代碼';
  console.log(`   - ID: ${s.id}, 名稱: ${s.name}, 代碼: ${code}`);
});

// 3. 檢查12/10的數據
console.log('\n3️⃣  檢查 12/10 的收款記錄...');

const dates = ['2025-12-10', '2024-12-10', '2023-12-10'];

dates.forEach(date => {
  const count = db.prepare(`
    SELECT COUNT(*) as count
    FROM payments
    WHERE DATE(paid_at) = ?
  `).get(date);

  if (count.count > 0) {
    console.log(`\n   📅 ${date}: ${count.count} 筆記錄`);

    const records = db.prepare(`
      SELECT p.uuid, p.payment_method, p.amount, p.paid_at, p.note, p.status,
             s.name as store_name, s.code as store_code
      FROM payments p
      LEFT JOIN stores s ON p.store_id = s.id
      WHERE DATE(p.paid_at) = ?
      ORDER BY p.paid_at DESC
      LIMIT 10
    `).all(date);

    records.forEach(r => {
      const storeName = r.store_name || '未知';
      const note = r.note || '無備註';
      const time = r.paid_at.substring(0, 19);
      console.log(`   - ${time} | ${storeName} | ${r.payment_method} | $${r.amount} | ${note}`);
    });
  }
});

// 4. 檢查審計日誌
console.log('\n4️⃣  檢查最近的刪除記錄...');
try {
  const auditLogs = db.prepare(`
    SELECT * FROM audit_logs
    WHERE action = 'delete'
    AND created_at >= datetime('now', '-7 days')
    ORDER BY created_at DESC
    LIMIT 20
  `).all();

  if (auditLogs.length > 0) {
    console.log(`   找到 ${auditLogs.length} 條刪除記錄:`);
    auditLogs.forEach(log => {
      console.log(`   - ${log.created_at} | 用戶: ${log.username} | ${log.details}`);
    });
  } else {
    console.log('   ✅ 最近7天無刪除記錄');
  }
} catch (e) {
  console.log('   ⚠️  審計日誌表不存在');
}

// 5. 對比今天的數據
console.log('\n5️⃣  對比今天的記錄數...');
const todayCount = db.prepare(`
  SELECT COUNT(*) as count
  FROM payments
  WHERE DATE(paid_at) = '2025-12-09'
`).get();
console.log(`   2025-12-09: ${todayCount.count} 筆記錄`);

// 6. 按分店統計12/10數據
console.log('\n6️⃣  按分店統計 12/10 數據...');
const storeStats = db.prepare(`
  SELECT s.name, s.code, COUNT(*) as count
  FROM payments p
  LEFT JOIN stores s ON p.store_id = s.id
  WHERE DATE(p.paid_at) LIKE '%12-10%'
  GROUP BY p.store_id
  ORDER BY count DESC
`).all();

if (storeStats.length > 0) {
  storeStats.forEach(s => {
    const storeName = s.name || '未知分店';
    const storeCode = s.code || '無代碼';
    console.log(`   - ${storeName} (${storeCode}): ${s.count} 筆`);
  });
} else {
  console.log('   ❌ 沒有找到任何 12/10 的數據');
}

// 7. 檢查最近7天的數據趨勢
console.log('\n7️⃣  最近7天的數據趨勢...');
for (let i = 0; i < 7; i++) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split('T')[0];

  const dayCount = db.prepare(`
    SELECT COUNT(*) as count
    FROM payments
    WHERE DATE(paid_at) = ?
  `).get(dateStr);

  console.log(`   ${dateStr}: ${dayCount.count} 筆`);
}

console.log('\n' + '='.repeat(70));

db.close();
