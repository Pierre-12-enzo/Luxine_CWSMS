const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db');

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const query = 'SELECT * FROM Users WHERE Username = ?';

  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];

    // Use bcrypt to compare the entered password with the hashed password from DB
    const match = await bcrypt.compare(password, user.Password); // Assuming 'Password' is the hashed field

    if (match) {
      // Set user session
      req.session.user = {
        id: user.UserID,
        username: user.Username,
        fullName: user.FullName
      };

      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.UserID,
          username: user.Username,
          fullName: user.FullName
        }
      });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});


// Check if user is logged in
router.get('/check', (req, res) => {
  if (req.session.user) {
    return res.status(200).json({
      isLoggedIn: true,
      user: req.session.user
    });
  } else {
    return res.status(200).json({
      isLoggedIn: false
    });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }

    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logout successful' });
  });
});

module.exports = router;
