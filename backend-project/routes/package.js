const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all packages
router.get('/', (req, res) => {
  const query = 'SELECT * FROM packages';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching packages:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.status(200).json(results);
  });
});

// Get package by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM packages WHERE PackageNumber = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching package:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.status(200).json(results[0]);
  });
});

// Add new package
router.post('/', (req, res) => {
  const { packageName, packageDescription, packagePrice } = req.body;

  if (!packageName || !packageDescription || !packagePrice) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = 'INSERT INTO packages (PackageName, PackageDescription, PackagePrice) VALUES (?, ?, ?)';

  db.query(query, [packageName, packageDescription, packagePrice], (err, result) => {
    if (err) {
      console.error('Error adding package:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.status(201).json({
      message: 'Package added successfully',
      package: {
        packageNumber: result.insertId,
        packageName,
        packageDescription,
        packagePrice
      }
    });
  });
});

// Update package
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { packageName, packageDescription, packagePrice } = req.body;

  if (!packageName || !packageDescription || !packagePrice) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = 'UPDATE packages SET PackageName = ?, PackageDescription = ?, PackagePrice = ? WHERE PackageNumber = ?';

  db.query(query, [packageName, packageDescription, packagePrice, id], (err, result) => {
    if (err) {
      console.error('Error updating package:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.status(200).json({
      message: 'Package updated successfully',
      package: {
        packageNumber: id,
        packageName,
        packageDescription,
        packagePrice
      }
    });
  });
});

// Delete package
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM packages WHERE PackageNumber = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting package:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.status(200).json({ message: 'Package deleted successfully' });
  });
});

module.exports = router;
