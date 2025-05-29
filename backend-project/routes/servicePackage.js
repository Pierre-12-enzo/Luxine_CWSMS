const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all service packages
router.get('/', (req, res) => {
  const query = `
    SELECT sp.RecordNumber, sp.ServiceDate, c.PlateNumber, c.DriverName, c.CarType, c.CarSize,
           p.PackageNumber, p.PackageName, p.PackageDescription, p.PackagePrice
    FROM servicePackages sp
    JOIN cars c ON sp.PlateNumber = c.PlateNumber
    JOIN packages p ON sp.PackageNumber = p.PackageNumber
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching service packages:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.status(200).json(results);
  });
});

// Get service package by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT sp.RecordNumber, sp.ServiceDate, c.PlateNumber, c.DriverName, c.CarType, c.CarSize,
           p.PackageNumber, p.PackageName, p.PackageDescription, p.PackagePrice
    FROM servicePackages sp
    JOIN cars c ON sp.PlateNumber = c.PlateNumber
    JOIN packages p ON sp.PackageNumber = p.PackageNumber
    WHERE sp.RecordNumber = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching service package:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Service package not found' });
    }

    res.status(200).json(results[0]);
  });
});

// Add new service package
router.post('/', (req, res) => {
  const { serviceDate, plateNumber, packageNumber } = req.body;

  if (!serviceDate || !plateNumber || !packageNumber) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = 'INSERT INTO servicePackages (ServiceDate, PlateNumber, PackageNumber) VALUES (?, ?, ?)';

  db.query(query, [serviceDate, plateNumber, packageNumber], (err, result) => {
    if (err) {
      console.error('Error adding service package:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.status(201).json({
      message: 'Service package added successfully',
      servicePackage: {
        recordNumber: result.insertId,
        serviceDate,
        plateNumber,
        packageNumber
      }
    });
  });
});

// Update service package
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { serviceDate, plateNumber, packageNumber } = req.body;

  if (!serviceDate || !plateNumber || !packageNumber) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = 'UPDATE servicePackages SET ServiceDate = ?, PlateNumber = ?, PackageNumber = ? WHERE RecordNumber = ?';

  db.query(query, [serviceDate, plateNumber, packageNumber, id], (err, result) => {
    if (err) {
      console.error('Error updating service package:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service package not found' });
    }

    res.status(200).json({
      message: 'Service package updated successfully',
      servicePackage: {
        recordNumber: id,
        serviceDate,
        plateNumber,
        packageNumber
      }
    });
  });
});

// Delete service package
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM servicePackages WHERE RecordNumber = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting service package:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service package not found' });
    }

    res.status(200).json({ message: 'Service package deleted successfully' });
  });
});

module.exports = router;
