const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { authenticateToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// Admin dashboard stats
router.get('/dashboard', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const totalUsers = await new Promise(resolve => {
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => resolve(row?.count || 0));
    });
    const totalStores = await new Promise(resolve => {
      db.get('SELECT COUNT(*) as count FROM stores', (err, row) => resolve(row?.count || 0));
    });
    const totalRatings = await new Promise(resolve => {
      db.get('SELECT COUNT(*) as count FROM ratings', (err, row) => resolve(row?.count || 0));
    });
    res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// List users (filter by role if ?role=store_owner,user,admin)
router.get('/users', authenticateToken, checkRole(['admin']), async (req, res) => {
  const { role } = req.query;
  try {
    const query = role
      ? 'SELECT id, name, email, address, role FROM users WHERE role = ?'
      : 'SELECT id, name, email, address, role FROM users';
    const users = await new Promise(resolve => {
      db.all(query, role ? [role] : [], (err, rows) => resolve(rows || []));
    });
    res.json(users);
  } catch (err) {
    console.error('Users fetch error:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Create user OR store_owner OR admin
router.post('/users', authenticateToken, checkRole(['admin']), async (req, res) => {
  const { name, email, password, address, role } = req.body;
  try {
    // Email uniqueness
    const exists = await new Promise(resolve => {
      db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => resolve(!!row));
    });
    if (exists) return res.status(400).json({ errors: [{ msg: 'Email already exists' }] });

    // Validation
    if (!name || !email || !password || !address || !role) {
      return res.status(400).json({ errors: [{ msg: 'All fields are required' }] });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ errors: [{ msg: 'Invalid email format' }] });
    }
    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/.test(password)) {
      return res.status(400).json({
        errors: [{
          msg: 'Password must be 8-16 characters with at least one uppercase and one special character'
        }]
      });
    }
    if (!['user', 'store_owner', 'admin'].includes(role)) {
      return res.status(400).json({ errors: [{ msg: 'Invalid role' }] });
    }

    // Hash & insert
    const hashed = await bcrypt.hash(password, 10);
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashed, address, role],
        err => err ? reject(err) : resolve()
      );
    });
    res.status(201).json({ message: 'User added successfully' });
  } catch (err) {
    console.error('Add user error:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Delete user by ID
router.delete('/users/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const exists = await new Promise(resolve => {
      db.get('SELECT id FROM users WHERE id = ?', [id], (err, row) => resolve(!!row));
    });
    if (!exists) return res.status(404).json({ errors: [{ msg: 'User not found' }] });

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [id], err => err ? reject(err) : resolve());
    });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// List stores with avgRating & ratingCount
router.get('/stores', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const stores = await new Promise(resolve => {
      db.all(
        `SELECT
           s.id, s.name, s.email, s.address,
           u.name     AS ownerName,
           COALESCE(AVG(r.rating), 0) AS avgRating,
           COUNT(r.id)               AS ratingCount
         FROM stores s
         LEFT JOIN users u   ON s.ownerId = u.id
         LEFT JOIN ratings r ON s.id     = r.storeId
         GROUP BY s.id`,
        (err, rows) => {
          if (err) return resolve([]);
          resolve(rows.map(r => ({
            id: r.id,
            name: r.name,
            email: r.email,
            address: r.address,
            ownerName: r.ownerName,
            avgRating: parseFloat(r.avgRating).toFixed(1),
            ratingCount: r.ratingCount
          })));
        }
      );
    });
    res.json(stores);
  } catch (err) {
    console.error('Stores fetch error:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Create new store
router.post('/stores', authenticateToken, checkRole(['admin']), async (req, res) => {
  const { name, email, address, ownerId } = req.body;
  try {
    const exists = await new Promise(resolve => {
      db.get('SELECT id FROM stores WHERE email = ?', [email], (err, row) => resolve(!!row));
    });
    if (exists) return res.status(400).json({ errors: [{ msg: 'Store email already exists' }] });

    const ownerExists = await new Promise(resolve => {
      db.get('SELECT id FROM users WHERE id = ? AND role = ?', [ownerId, 'store_owner'], (err, row) => resolve(!!row));
    });
    if (!ownerExists) return res.status(400).json({ errors: [{ msg: 'Invalid store owner' }] });

    const storeId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO stores (name, email, address, ownerId) VALUES (?, ?, ?, ?)',
        [name, email, address, ownerId],
        function (err) { err ? reject(err) : resolve(this.lastID); }
      );
    });
    res.status(201).json({ message: 'Store added successfully', storeId });
  } catch (err) {
    console.error('Add store error:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Get all ratings for a specific store
router.get('/stores/:storeId/ratings', authenticateToken, checkRole(['admin']), async (req, res) => {
  const { storeId } = req.params;
  try {
    const store = await new Promise(resolve => {
      db.get('SELECT id FROM stores WHERE id = ?', [storeId], (err, row) => resolve(row));
    });
    if (!store) return res.status(404).json({ errors: [{ msg: 'Store not found' }] });

    const ratings = await new Promise(resolve => {
      db.all(
        `SELECT
           r.id, r.userId, r.rating, r.createdAt,
           u.name  AS userName,
           u.email AS userEmail
         FROM ratings r
         JOIN users u ON r.userId = u.id
         WHERE r.storeId = ?`,
        [storeId],
        (err, rows) => {
          if (err) return resolve([]);
          resolve(rows.map(r => ({
            id: r.id,
            userId: r.userId,
            rating: r.rating,
            createdAt: r.createdAt,
            user: { id: r.userId, name: r.userName, email: r.userEmail }
          })));
        }
      );
    });
    res.json(ratings);
  } catch (err) {
    console.error('Fetch store ratings error:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

module.exports = router;