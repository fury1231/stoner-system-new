const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new Database(dbPath);

const newPassword = 'stoner420';
const newHash = bcrypt.hashSync(newPassword, 10);

console.log('Updating admin password...');
console.log('New hash:', newHash);

// Update the admin user password
const result = db.prepare(`
  UPDATE users 
  SET password_hash = ? 
  WHERE username = 'admin'
`).run(newHash);

if (result.changes > 0) {
  console.log('✅ Admin password updated successfully');
} else {
  console.log('❌ No admin user found to update');
}

// Verify the update
const adminUser = db.prepare(`
  SELECT username, password_hash, role 
  FROM users 
  WHERE username = 'admin'
`).get();

if (adminUser) {
  console.log('Admin user found:', adminUser.username, 'role:', adminUser.role);
  const isValid = bcrypt.compareSync(newPassword, adminUser.password_hash);
  console.log('Password verification:', isValid);
} else {
  console.log('No admin user found');
}

db.close();