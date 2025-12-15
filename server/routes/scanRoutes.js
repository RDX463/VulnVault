const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');

// POST /api/scan
router.post('/scan', scanController.runScan);

module.exports = router;
