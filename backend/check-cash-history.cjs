const Database = require('better-sqlite3');
const db = new Database('/var/www/stoner-system/data/database.sqlite', { readonly: true });

console.log('\n📈 歷史現金餘額變化分析\n');
console.log('='.repeat(80));

const getBasePaymentMethod = (paymentMethod) => {
  if (paymentMethod.startsWith('員工購物-')) {
    return paymentMethod.replace('員工購物-', '');
  }
  return paymentMethod;
};

// 獲取所有分店
const stores = db.prepare('SELECT id, name, code FROM stores WHERE is_active = 1').all();

stores.forEach(store => {
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`🏪 分店: ${store.name} (${store.code || '無代碼'})`);
  console.log(`${'─'.repeat(80)}`);

  // 按時間順序獲取所有現金相關記錄
  const payments = db.prepare(`
    SELECT uuid, payment_method, amount, paid_at, note, status, created_at
    FROM payments
    WHERE store_id = ?
    AND status != 'cancelled'
    ORDER BY paid_at ASC, created_at ASC
  `).all(store.id);

  // 過濾出現金相關交易
  const cashPayments = payments.filter(p => {
    const baseMethod = getBasePaymentMethod(p.payment_method);
    return baseMethod === '現金' || baseMethod === '提領' || baseMethod === '店內支出';
  });

  if (cashPayments.length === 0) {
    console.log('   ✅ 無現金交易記錄');
  } else {

  let balance = 0;
  let minBalance = 0;
  let minBalanceDate = '';
  let minBalanceRecord = null;
  let negativeCount = 0;

  console.log(`\n   找到 ${cashPayments.length} 筆現金相關交易\n`);

  cashPayments.forEach((p, index) => {
    const baseMethod = getBasePaymentMethod(p.payment_method);
    const prevBalance = balance;

    if (baseMethod === '提領' || baseMethod === '店內支出') {
      balance -= p.amount;
    } else {
      balance += p.amount;
    }

    // 記錄最低餘額
    if (balance < minBalance) {
      minBalance = balance;
      minBalanceDate = p.paid_at;
      minBalanceRecord = p;
    }

    // 記錄負數次數
    if (balance < 0) {
      negativeCount++;
    }

    // 顯示前 10 筆和最後 10 筆交易
    if (index < 5 || index >= cashPayments.length - 5 || balance < 0) {
      const time = p.paid_at.substring(0, 19);
      const note = (p.note || '').substring(0, 30);
      const sign = baseMethod === '提領' || baseMethod === '店內支出' ? '-' : '+';
      const balanceStr = balance < 0 ? `⚠️ $${balance.toLocaleString()}` : `$${balance.toLocaleString()}`;

      if (balance < 0) {
        console.log(`   ❌ ${time} | ${baseMethod.padEnd(8)} | ${sign}$${p.amount.toLocaleString().padStart(8)} | 餘額: ${balanceStr} | ${note}`);
      } else if (index < 5 || index >= cashPayments.length - 5) {
        console.log(`   ✓  ${time} | ${baseMethod.padEnd(8)} | ${sign}$${p.amount.toLocaleString().padStart(8)} | 餘額: ${balanceStr} | ${note}`);
      }
    } else if (index === 5 && cashPayments.length > 15) {
      console.log(`   ... (省略 ${cashPayments.length - 10} 筆正常交易) ...`);
    }
  });

  console.log(`\n   📊 統計結果：`);
  console.log(`   - 最終餘額：$${balance.toLocaleString()} ${balance < 0 ? '⚠️ 負數！' : '✅'}`);
  console.log(`   - 最低餘額：$${minBalance.toLocaleString()} ${minBalance < 0 ? '⚠️ 負數！' : '✅'}`);
  if (minBalance < 0) {
    console.log(`   - 最低點時間：${minBalanceDate.substring(0, 19)}`);
    console.log(`   - 負數出現次數：${negativeCount} 次 (佔 ${(negativeCount/cashPayments.length*100).toFixed(1)}%)`);
  }
  }
});

console.log('\n' + '='.repeat(80));

// 檢查最近 30 天是否有負數
console.log('\n🔍 最近 30 天負數出現情況：\n');

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

stores.forEach(store => {
  const payments = db.prepare(`
    SELECT uuid, payment_method, amount, paid_at, status
    FROM payments
    WHERE store_id = ?
    AND DATE(paid_at) >= ?
    AND status != 'cancelled'
    ORDER BY paid_at ASC
  `).all(store.id, cutoffDate);

  const cashPayments = payments.filter(p => {
    const baseMethod = getBasePaymentMethod(p.payment_method);
    return baseMethod === '現金' || baseMethod === '提領' || baseMethod === '店內支出';
  });

  // 計算該店在30天前的起始餘額
  const allPaymentsBeforeCutoff = db.prepare(`
    SELECT payment_method, amount
    FROM payments
    WHERE store_id = ?
    AND DATE(paid_at) < ?
    AND status != 'cancelled'
    ORDER BY paid_at ASC
  `).all(store.id, cutoffDate);

  let startBalance = 0;
  allPaymentsBeforeCutoff.forEach(p => {
    const baseMethod = getBasePaymentMethod(p.payment_method);
    if (baseMethod === '現金') {
      startBalance += p.amount;
    } else if (baseMethod === '提領' || baseMethod === '店內支出') {
      startBalance -= p.amount;
    }
  });

  let balance = startBalance;
  let hasNegative = false;

  cashPayments.forEach(p => {
    const baseMethod = getBasePaymentMethod(p.payment_method);
    if (baseMethod === '提領' || baseMethod === '店內支出') {
      balance -= p.amount;
    } else {
      balance += p.amount;
    }

    if (balance < 0) {
      hasNegative = true;
    }
  });

  if (hasNegative) {
    console.log(`   ⚠️  ${store.name}: 最近30天曾出現負數`);
  } else {
    console.log(`   ✅ ${store.name}: 最近30天始終為正數`);
  }
});

console.log('\n' + '='.repeat(80) + '\n');

db.close();
