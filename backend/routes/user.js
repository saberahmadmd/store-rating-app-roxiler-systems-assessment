const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, checkRole } = require('../middleware/auth');

// User dashboard stats
router.get('/dashboard', authenticateToken, checkRole(['user']), (req, res) => {
  db.get(
    'SELECT COUNT(*) as totalRatings FROM ratings WHERE userId = ?',
    [req.user.id],
    (err, row) => {
      if (err) {
        console.error('Dashboard error:', err);
        return res.status(500).json({ errors: [{ msg: 'Server error' }] });
      }
      res.json({ totalRatings: row.totalRatings });
    }
  );
});

// List all stores for rating
router.get('/stores', authenticateToken, checkRole(['user']), (req, res) => {
  db.all(
    `SELECT 
       s.id, 
       s.name, 
       s.email, 
       s.address, 
       u.name AS ownerName, 
       COALESCE(AVG(r.rating), 0) AS avgRating, 
       COUNT(r.id) AS ratingCount
     FROM stores s
     LEFT JOIN users u    ON s.ownerId = u.id
     LEFT JOIN ratings r  ON s.id     = r.storeId
     GROUP BY s.id`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Stores fetch error:', err);
        return res.status(500).json({ errors: [{ msg: 'Server error' }] });
      }
      const stores = rows.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        address: r.address,
        ownerName: r.ownerName,
        avgRating: parseFloat(r.avgRating).toFixed(1),
        ratingCount: r.ratingCount
      }));
      res.json(stores);
    }
  );
});

// Get this user's ratings (with store names)
router.get('/ratings', authenticateToken, checkRole(['user']), (req, res) => {
  db.all(
    `SELECT 
       r.storeId, 
       s.name AS storeName, 
       r.rating, 
       r.createdAt 
     FROM ratings r
     JOIN stores s ON r.storeId = s.id
     WHERE r.userId = ?`,
    [req.user.id],
    (err, rows) => {
      if (err) {
        console.error('Ratings fetch error:', err);
        return res.status(500).json({ errors: [{ msg: 'Server error' }] });
      }
      res.json(rows);
    }
  );
});

// Submit or update a rating
router.post('/rating', authenticateToken, checkRole(['user']), (req, res) => {
  const { storeId, rating } = req.body;
  if (!storeId || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ errors: [{ msg: 'Invalid store ID or rating' }] });
  }
  db.run(
    'INSERT OR REPLACE INTO ratings (userId, storeId, rating) VALUES (?, ?, ?)',
    [req.user.id, storeId, rating],
    function(err) {
      if (err) {
        console.error('Rating submit error:', err);
        return res.status(500).json({ errors: [{ msg: 'Server error' }] });
      }
      res.status(201).json({ message: 'Rating submitted' });
    }
  );
});

module.exports = router;