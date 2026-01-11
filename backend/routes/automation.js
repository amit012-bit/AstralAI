/**
 * Automation Routes
 * Handles automated data extraction and parsing
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const solutionParserController = require('../controllers/automation/solutionParserController');
const vendorParserController = require('../controllers/automation/vendorParserController');

/**
 * @route   POST /api/automation/solutions/parse-website
 * @desc    Parse website and extract solution data
 * @access  Private (Vendors and Superadmins)
 */
router.post('/solutions/parse-website', authenticate, authorize('vendor', 'superadmin'), solutionParserController.parseWebsite);

/**
 * @route   POST /api/automation/vendor/parse-website
 * @desc    Parse website and extract vendor info + multiple products
 * @access  Private (Vendors and Superadmins)
 */
router.post('/vendor/parse-website', authenticate, authorize('vendor', 'superadmin'), vendorParserController.parseVendorWebsite);

module.exports = router;
