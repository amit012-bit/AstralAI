/**
 * Vendors Routes
 * Handles vendor profile endpoints
 */

const express = require('express');
const router = express.Router();
const {
  createOrUpdateVendor,
  getVendor,
  getVendorByUserId
} = require('../controllers/vendorController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/vendor
 * @desc    Create or update vendor profile
 * @access  Private (Vendor only)
 */
router.post('/', authenticate, createOrUpdateVendor);

/**
 * @route   GET /api/vendor
 * @desc    Get current user's vendor profile
 * @access  Private
 */
router.get('/', authenticate, getVendor);

/**
 * @route   GET /api/vendor/:userId
 * @desc    Get vendor profile by user ID
 * @access  Private
 */
router.get('/:userId', authenticate, getVendorByUserId);

module.exports = router;
