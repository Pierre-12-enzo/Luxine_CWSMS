const express = require('express');
const router = express.Router();
const db = require('../db');

// Get daily report
router.get('/daily/:date', (req, res) => {
  const { date } = req.params;

  const query = `
    SELECT c.PlateNumber, pkg.PackageName, pkg.PackageDescription,
           p.AmountPaid, p.PaymentDate
    FROM payments p
    JOIN servicePackages sp ON p.RecordNumber = sp.RecordNumber
    JOIN cars c ON sp.PlateNumber = c.PlateNumber
    JOIN packages pkg ON sp.PackageNumber = pkg.PackageNumber
    WHERE DATE(p.PaymentDate) = ?
    ORDER BY p.PaymentDate DESC
  `;

  db.query(query, [date], (err, results) => {
    if (err) {
      console.error('Error generating daily report:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    // Calculate total amount
    const totalAmount = results.reduce((sum, record) => sum + parseFloat(record.AmountPaid), 0);

    res.status(200).json({
      date,
      totalAmount,
      records: results,
      count: results.length
    });
  });
});

// Get all payments for reports
router.get('/payments', (req, res) => {
  const query = `
    SELECT c.PlateNumber, pkg.PackageName, pkg.PackageDescription,
           p.AmountPaid, p.PaymentDate
    FROM payments p
    JOIN servicePackages sp ON p.RecordNumber = sp.RecordNumber
    JOIN cars c ON sp.PlateNumber = c.PlateNumber
    JOIN packages pkg ON sp.PackageNumber = pkg.PackageNumber
    ORDER BY p.PaymentDate DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error generating payments report:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.status(200).json(results);
  });
});

// Get summary report
router.get('/summary', (req, res) => {
  const carCountQuery = 'SELECT COUNT(*) as carCount FROM cars';
  const serviceCountQuery = 'SELECT COUNT(*) as serviceCount FROM servicePackages';
  const paymentSumQuery = 'SELECT SUM(AmountPaid) as totalRevenue FROM payments';
  const packageCountQuery = 'SELECT COUNT(*) as packageCount FROM packages';

  db.query(carCountQuery, (err, carResults) => {
    if (err) {
      console.error('Error getting car count:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    db.query(serviceCountQuery, (err, serviceResults) => {
      if (err) {
        console.error('Error getting service count:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      db.query(paymentSumQuery, (err, paymentResults) => {
        if (err) {
          console.error('Error getting payment sum:', err);
          return res.status(500).json({ message: 'Server error' });
        }

        db.query(packageCountQuery, (err, packageResults) => {
          if (err) {
            console.error('Error getting package count:', err);
            return res.status(500).json({ message: 'Server error' });
          }

          res.status(200).json({
            carCount: carResults[0].carCount,
            serviceCount: serviceResults[0].serviceCount,
            totalRevenue: paymentResults[0].totalRevenue || 0,
            packageCount: packageResults[0].packageCount
          });
        });
      });
    });
  });
});

module.exports = router;
