const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { seedAdmin, seedOwner } = require('../utils/seed');

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const dbFile = path.join(dataDir, 'database.sqlite');
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Error connecting to SQLite:', err);
  } else {
    console.log('Connected to SQLite database at', dbFile);
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        address TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'store_owner', 'admin'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS stores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        address TEXT NOT NULL,
        ownerId INTEGER,
        FOREIGN KEY (ownerId) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        storeId INTEGER,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (storeId) REFERENCES stores(id),
        UNIQUE(userId, storeId)
      )
    `);

    seedAdmin(db);
    seedOwner(db);
  });
}

module.exports = db;