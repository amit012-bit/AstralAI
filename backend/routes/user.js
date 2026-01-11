/**
 * User Routes
 * Handles user data endpoints (for solutions-hub-main compatibility)
 */

const express = require('express');
const router = express.Router();
const {
  getUserData,
  updateUserRole
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   GET /api/user
 * @desc    Get user data with profile flags
 * @access  Private
 */
router.get('/', authenticate, getUserData);

/**
 * @route   POST /api/user
 * @desc    Update user role (maps buyer->customer, seller->vendor)
 * @access  Private
 */
router.post('/', authenticate, updateUserRole);

module.exports = router;
