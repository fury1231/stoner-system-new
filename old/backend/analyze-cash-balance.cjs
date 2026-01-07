const Database = require('better-sqlite3');
const db = new Database('/var/www/stoner-system/data/database.sqlite', { readonly: true });

console.log('\n💰 分析各分店現金流向\n');
console.log('='.repeat(80));

// 取得基礎付款方式（將員工購物映射到對應的基礎方式）
const getBasePaymentMethod = (paymentMethod) => {
  if (paymentMethod.startsWith('員工購物-')) {
    return paymentMethod.replace('員工購物-', '');
  }
  return paymentMethod;
};

// 1. 獲取所有分店
const stores = db.prepare('SELECT id, name, code FROM stores WHERE is_active = 1').all();

console.log(`\n📍 找到 ${stores.length} 個分店\n`);

// 2. 對每個分店分析現金流向
stores.forEach(store => {
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`🏪 分店: ${store.name} (${store.code || '無代碼'})`);
  console.log(`${'─'.repeat(80)}`);

  // 獲取該分店的所有現金相關記錄
  const payments = db.prepare(`
    SELECT uuid, payment_method, amount, paid_at, note, status, created_at
    FROM payments
    WHERE store_id = ?
    AND status != 'cancelled'
    ORDER BY paid_at DESC
  `).all(store.id);

  // 分類統計
  const stats = {
    現金收入: { count: 0, total: 0, records: [] },
    提領: { count: 0, total: 0, records: [] },
    店內支出: { count: 0, total: 0, records: [] },
    其他: { count: 0, total: 0, records: [] }
  };

  let cashBalance = 0;

  payments.forEach(p => {
    const baseMethod = getBasePaymentMethod(p.payment_method);

    if (baseMethod === '現金') {
      stats.現金收入.count++;
      stats.現金收入.total += p.amount;
      cashBalance += p.amount;
      stats.現金收入.records.push(p);
    } else if (baseMethod === '提領') {
      stats.提領.count++;
      stats.提領.total += p.amount;
      cashBalance -= p.amount;
      stats.提領.records.push(p);
    } else if (baseMethod === '店內支出') {
      stats.店內支出.count++;
      stats.店內支出.total += p.amount;
      cashBalance -= p.amount;
      stats.店內支出.records.push(p);
    } else {
      stats.其他.count++;
      stats.其他.total += p.amount;
      stats.其他.records.push(p);
    }
  });

  // 顯示統計
  console.log('\n📊 現金流向統計：');
  console.log(`   現金收入：${stats.現金收入.count} 筆，總額 $${stats.現金收入.total.toLocaleString()}`);
  console.log(`   提領：    ${stats.提領.count} 筆，總額 $${stats.提領.total.toLocaleString()}`);
  console.log(`   店內支出：${stats.店內支出.count} 筆，總額 $${stats.店內支出.total.toLocaleString()}`);
  console.log(`   其他：    ${stats.其他.count} 筆，總額 $${stats.其他.total.toLocaleString()}`);

  console.log(`\n💵 計算結果：`);
  console.log(`   現金總額 = 現金收入($${stats.現金收入.total.toLocaleString()}) - 提領($${stats.提領.total.toLocaleString()}) - 店內支出($${stats.店內支出.total.toLocaleString()})`);
  console.log(`   現金總額 = $${cashBalance.toLocaleString()}`);

  if (cashBalance < 0) {
    console.log(`\n⚠️  警告：現金總額為負數！`);
    console.log(`\n🔍 詳細分析：`);

    // 顯示最近的提領記錄
    if (stats.提領.count > 0) {
      console.log(`\n   最近 5 筆提領記錄：`);
      stats.提領.records.slice(0, 5).forEach(r => {
        const time = r.paid_at.substring(0, 19);
        const note = r.note || '無備註';
        console.log(`   - ${time} | $${r.amount.toLocaleString()} | ${note}`);
      });
    }

    // 顯示最近的店內支出記錄
    if (stats.店內支出.count > 0) {
      console.log(`\n   最近 5 筆店內支出記錄：`);
      stats.店內支出.records.slice(0, 5).forEach(r => {
        const time = r.paid_at.substring(0, 19);
        const note = r.note || '無備註';
        console.log(`   - ${time} | $${r.amount.toLocaleString()} | ${note}`);
      });
    }

    // 顯示最近的現金收入記錄
    if (stats.現金收入.count > 0) {
      console.log(`\n   最近 5 筆現金收入記錄：`);
      stats.現金收入.records.slice(0, 5).forEach(r => {
        const time = r.paid_at.substring(0, 19);
        const note = r.note || '無備註';
        const method = r.payment_method;
        console.log(`   - ${time} | ${method} | $${r.amount.toLocaleString()} | ${note}`);
      });
    }
  } else {
    console.log(`\n✅ 現金總額正常`);
  }
});

console.log('\n' + '='.repeat(80));

// 3. 總體統計
console.log('\n📈 全系統總覽：\n');

const allPayments = db.prepare(`
  SELECT payment_method, COUNT(*) as count, SUM(amount) as total
  FROM payments
  WHERE status != 'cancelled'
  GROUP BY payment_method
  ORDER BY total DESC
`).all();

allPayments.forEach(p => {
  console.log(`   ${p.payment_method}: ${p.count} 筆，總額 $${p.total.toLocaleString()}`);
});

// 4. 檢查是否有異常大額交易
console.log('\n\n🔍 檢查異常大額交易（>= $10,000）：\n');

const largeTransactions = db.prepare(`
  SELECT p.uuid, p.payment_method, p.amount, p.paid_at, p.note,
         s.name as store_name, s.code as store_code
  FROM payments p
  LEFT JOIN stores s ON p.store_id = s.id
  WHERE p.amount >= 10000
  AND p.status != 'cancelled'
  ORDER BY p.amount DESC
  LIMIT 20
`).all();

if (largeTransactions.length > 0) {
  largeTransactions.forEach(t => {
    const time = t.paid_at.substring(0, 19);
    const storeName = t.store_name || '未知';
    const note = t.note || '無備註';
    console.log(`   ${time} | ${storeName} | ${t.payment_method} | $${t.amount.toLocaleString()} | ${note}`);
  });
} else {
  console.log('   ✅ 無大額交易');
}

console.log('\n' + '='.repeat(80) + '\n');

db.close();
