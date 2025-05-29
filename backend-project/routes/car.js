const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all cars
router.get('/', (req, res) => {
  const query = 'SELECT * FROM cars';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching cars:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.status(200).json(results);
  });
});

// Get car by plate number
router.get('/:plateNumber', (req, res) => {
  const { plateNumber } = req.params;
  const query = 'SELECT * FROM cars WHERE PlateNumber = ?';

  db.query(query, [plateNumber], (err, results) => {
    if (err) {
      console.error('Error fetching car:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json(results[0]);
  });
});

// Add new car
router.post('/', (req, res) => {
  const { plateNumber, carType, carSize, driverName, phoneNumber } = req.body;

  if (!plateNumber || !carType || !carSize || !driverName || !phoneNumber) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = 'INSERT INTO cars (PlateNumber, CarType, CarSize, DriverName, PhoneNumber) VALUES (?, ?, ?, ?, ?)';

  db.query(query, [plateNumber, carType, carSize, driverName, phoneNumber], (err, result) => {
    if (err) {
      console.error('Error adding car:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.status(201).json({
      message: 'Car added successfully',
      car: {
        plateNumber,
        carType,
        carSize,
        driverName,
        phoneNumber
      }
    });
  });
});

// Update car
router.put('/:plateNumber', (req, res) => {
  const { plateNumber } = req.params;
  const { carType, carSize, driverName, phoneNumber } = req.body;

  if (!carType || !carSize || !driverName || !phoneNumber) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = 'UPDATE cars SET CarType = ?, CarSize = ?, DriverName = ?, PhoneNumber = ? WHERE PlateNumber = ?';

  db.query(query, [carType, carSize, driverName, phoneNumber, plateNumber], (err, result) => {
    if (err) {
      console.error('Error updating car:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json({
      message: 'Car updated successfully',
      car: {
        plateNumber,
        carType,
        carSize,
        driverName,
        phoneNumber
      }
    });
  });
});

// Delete car
router.delete('/:plateNumber', (req, res) => {
  const { plateNumber } = req.params;
  const query = 'DELETE FROM cars WHERE PlateNumber = ?';

  db.query(query, [plateNumber], (err, result) => {
    if (err) {
      console.error('Error deleting car:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json({ message: 'Car deleted successfully' });
  });
});

module.exports = router;
