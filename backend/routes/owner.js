const express = require('express');
const db = require('../config/database');
const { authenticateToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// Owner dashboard stats
router.get('/dashboard', authenticateToken, checkRole(['store_owner']), async (req, res) => {
  try {
    const totalStores = await new Promise(resolve => {
      db.get(
        'SELECT COUNT(*) as count FROM stores WHERE ownerId = ?',
        [req.user.id],
        (err, row) => resolve(row?.count || 0)
      );
    });

    const totalRatings = await new Promise(resolve => {
      db.get(
        `SELECT COUNT(*) as count
         FROM ratings r
         JOIN stores s ON r.storeId = s.id
         WHERE s.ownerId = ?`,
        [req.user.id],
        (err, row) => resolve(row?.count || 0)
      );
    });

    const avgRating = await new Promise(resolve => {
      db.get(
        `SELECT AVG(r.rating) as avg
         FROM ratings r
         JOIN stores s ON r.storeId = s.id
         WHERE s.ownerId = ?`,
        [req.user.id],
        (err, row) =>
          resolve(row?.avg != null ? parseFloat(row.avg).toFixed(1) : '0.0')
      );
    });

    res.json({ totalStores, totalRatings, avgRating });
  } catch (err) {
    console.error('Owner dashboard error:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// List this owner's stores
router.get('/stores', authenticateToken, checkRole(['store_owner']), async (req, res) => {
  try {
    const stores = await new Promise(resolve => {
      db.all(
        'SELECT id, name, email, address FROM stores WHERE ownerId = ?',
        [req.user.id],
        (err, rows) => resolve(rows || [])
      );
    });
    res.json(stores);
  } catch (err) {
    console.error('Owner stores fetch error:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Ratings for one of this owner's stores
router.get('/stores/:storeId/ratings', authenticateToken, checkRole(['store_owner']), async (req, res) => {
  const { storeId } = req.params;
  try {
    // verify ownership
    const store = await new Promise(resolve => {
      db.get(
        'SELECT id FROM stores WHERE id = ? AND ownerId = ?',
        [storeId, req.user.id],
        (err, row) => resolve(row)
      );
    });
    if (!store) {
      return res.status(403).json({ errors: [{ msg: 'Unauthorized access to store' }] });
    }

    const ratings = await new Promise(resolve => {
      db.all(
        `SELECT 
           r.id,
           r.userId,
           r.rating,
           r.createdAt,
           u.name  AS userName,
           u.email AS userEmail
         FROM ratings r
         JOIN users u ON r.userId = u.id
         WHERE r.storeId = ?`,
        [storeId],
        (err, rows) => {
          if (err) return resolve([]);
          resolve(
            rows.map(r => ({
              id: r.id,
              userId: r.userId,
              rating: r.rating,
              createdAt: r.createdAt,
              user: { id: r.userId, name: r.userName, email: r.userEmail }
            }))
          );
        }
      );
    });

    res.json(ratings);
  } catch (err) {
    console.error('Owner ratings fetch error:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

module.exports = router;