/**
 * Institutions Routes
 * Handles healthcare institution profile endpoints
 */

const express = require('express');
const router = express.Router();
const {
  createOrUpdateInstitution,
  getInstitution,
  getInstitutionByUserId
} = require('../controllers/institutionController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/institution
 * @desc    Create or update institution profile
 * @access  Private (Customer only)
 */
router.post('/', authenticate, createOrUpdateInstitution);

/**
 * @route   GET /api/institution
 * @desc    Get current user's institution profile
 * @access  Private
 */
router.get('/', authenticate, getInstitution);

/**
 * @route   GET /api/institution/:userId
 * @desc    Get institution profile by user ID
 * @access  Private
 */
router.get('/:userId', authenticate, getInstitutionByUserId);

module.exports = router;
