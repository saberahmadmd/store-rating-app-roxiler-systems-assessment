const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { validateUser } = require('../middleware/validate');

const router = express.Router();

router.post('/register', validateUser, async (req, res) => {
  const { name, email, password, address, role = 'user' } = req.body;

  try {
    const userExists = await new Promise((resolve) => {
      db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
        if (err) throw err;
        resolve(!!row);
      });
    });

    if (userExists) {
      return res.status(400).json({ errors: [{ msg: 'Email already exists' }] });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, address, role],
        function (err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await new Promise((resolve) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) throw err;
        resolve(row);
      });
    });

    if (!user) {
      return res.status(401).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

module.exports = router;