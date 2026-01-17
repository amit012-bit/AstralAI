/**
 * Data Fields Routes
 * Handles data field management endpoints
 */

const express = require('express');
const router = express.Router();
const {
  getAllDataFields,
  getVendorFields,
  updateVendorFieldMappings
} = require('../controllers/dataFieldController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   GET /api/data-fields
 * @desc    Get all available data fields
 * @access  Private
 */
router.get('/', authenticate, getAllDataFields);

/**
 * @route   GET /api/data-fields/vendor/:vendorId
 * @desc    Get fields mapped to a vendor
 * @access  Private
 */
router.get('/vendor/:vendorId', authenticate, getVendorFields);

/**
 * @route   POST /api/data-fields/vendor/:vendorId/mappings
 * @desc    Update vendor field mappings
 * @access  Private
 */
router.post('/vendor/:vendorId/mappings', authenticate, updateVendorFieldMappings);

module.exports = router;
