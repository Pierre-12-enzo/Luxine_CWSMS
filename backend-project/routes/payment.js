const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all payments
router.get('/', (req, res) => {
  const query = `
    SELECT p.PaymentNumber, p.AmountPaid, p.PaymentDate, p.RecordNumber,
           sp.ServiceDate, c.PlateNumber, c.DriverName, pkg.PackageName, pkg.PackagePrice
    FROM payments p
    JOIN servicePackages sp ON p.RecordNumber = sp.RecordNumber
    JOIN cars c ON sp.PlateNumber = c.PlateNumber
    JOIN packages pkg ON sp.PackageNumber = pkg.PackageNumber
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching payments:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.status(200).json(results);
  });
});

// Get payment by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT p.PaymentNumber, p.AmountPaid, p.PaymentDate, p.RecordNumber,
           sp.ServiceDate, c.PlateNumber, c.DriverName, pkg.PackageName, pkg.PackagePrice
    FROM payments p
    JOIN servicePackages sp ON p.RecordNumber = sp.RecordNumber
    JOIN cars c ON sp.PlateNumber = c.PlateNumber
    JOIN packages pkg ON sp.PackageNumber = pkg.PackageNumber
    WHERE p.PaymentNumber = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching payment:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json(results[0]);
  });
});

// Add new payment
router.post('/', (req, res) => {
  const { amountPaid, paymentDate, recordNumber } = req.body;

  if (!amountPaid || !paymentDate || !recordNumber) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = 'INSERT INTO payments (AmountPaid, PaymentDate, RecordNumber) VALUES (?, ?, ?)';

  db.query(query, [amountPaid, paymentDate, recordNumber], (err, result) => {
    if (err) {
      console.error('Error adding payment:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.status(201).json({
      message: 'Payment added successfully',
      payment: {
        paymentNumber: result.insertId,
        amountPaid,
        paymentDate,
        recordNumber
      }
    });
  });
});

// Get bill for a specific service record
router.get('/bill/:recordNumber', (req, res) => {
  const { recordNumber } = req.params;
  const query = `
    SELECT c.PlateNumber, c.DriverName, c.PhoneNumber, c.CarType, c.CarSize,
           pkg.PackageName, pkg.PackageDescription, pkg.PackagePrice,
           sp.ServiceDate, sp.RecordNumber,
           p.PaymentNumber, p.AmountPaid, p.PaymentDate
    FROM servicePackages sp
    JOIN cars c ON sp.PlateNumber = c.PlateNumber
    JOIN packages pkg ON sp.PackageNumber = pkg.PackageNumber
    LEFT JOIN payments p ON sp.RecordNumber = p.RecordNumber
    WHERE sp.RecordNumber = ?
  `;

  db.query(query, [recordNumber], (err, results) => {
    if (err) {
      console.error('Error generating bill:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Service record not found' });
    }

    res.status(200).json(results[0]);
  });
});

module.exports = router;
