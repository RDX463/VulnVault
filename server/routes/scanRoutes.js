const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');

// Route to Start a Scan (POST)
router.post('/scan', scanController.runScan);

// Route to Check Status (GET) 
router.get('/scan/:id', scanController.getScanStatus);

module.exports = router;
