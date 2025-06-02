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

// Registration route
router.post('/register', async (req, res) => {
  const { username, password, fullName } = req.body;

  if (!username || !password || !fullName) {
    return res.status(400).json({ message: 'Username, password, and full name are required' });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if username already exists
    const checkQuery = 'SELECT * FROM Users WHERE Username = ?';

    db.query(checkQuery, [username], async (err, results) => {
      if (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (results.length > 0) {
        return res.status(409).json({ message: 'Username already exists' });
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const insertQuery = 'INSERT INTO Users (Username, Password, FullName) VALUES (?, ?, ?)';

      db.query(insertQuery, [username, hashedPassword, fullName], (err, result) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ message: 'Server error' });
        }

        res.status(201).json({
          message: 'User registered successfully',
          user: {
            id: result.insertId,
            username: username,
            fullName: fullName
          }
        });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error' });
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
