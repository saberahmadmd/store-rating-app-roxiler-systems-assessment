const bcrypt = require('bcrypt');

async function seedAdmin(db) {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'Admin123!';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  db.get('SELECT id FROM users WHERE email = ?', [adminEmail], (err, row) => {
    if (err) {
      console.error('Error checking for admin user:', err);
      return;
    }
    if (!row) {
      db.run(
        'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        ['System Administrator', adminEmail, hashedPassword, '123 Admin Street', 'admin'],
        (err) => {
          if (err) console.error('Error seeding admin user:', err);
          else console.log('Admin user seeded successfully');
        }
      );
    }
  });
}

async function seedOwner(db) {
  const ownerEmail = 'owner@example.com';
  const ownerPassword = 'Owner123!';
  const hashedPassword = await bcrypt.hash(ownerPassword, 10);

  db.get('SELECT id FROM users WHERE email = ?', [ownerEmail], (err, row) => {
    if (err) {
      console.error('Error checking for owner user:', err);
      return;
    }
    if (!row) {
      db.run(
        'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        ['Default Store Owner', ownerEmail, hashedPassword, '123 Owner Lane', 'store_owner'],
        (err) => {
          if (err) console.error('Error seeding owner user:', err);
          else console.log('Store owner seeded successfully');
        }
      );
    }
  });
}

module.exports = { seedAdmin, seedOwner };
