/**
 * Proposal Routes
 * Handles all proposal-related endpoints
 */

const express = require('express');
const router = express.Router();
const {
  createProposal,
  getProposals,
  getProposal,
  updateProposal,
  deleteProposal,
  addResponse,
  updateResponseStatus
} = require('../controllers/proposalController');

const { authenticate } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');

/**
 * @route   GET /api/proposals
 * @desc    Get all proposals with filtering
 * @access  Private
 */
router.get('/', authenticate, getProposals);

/**
 * @route   GET /api/proposals/:id
 * @desc    Get single proposal by ID
 * @access  Private
 */
router.get('/:id', authenticate, validateObjectId('id'), getProposal);

/**
 * @route   POST /api/proposals
 * @desc    Create new proposal
 * @access  Private (Customers and Vendors)
 */
router.post('/', authenticate, createProposal);

/**
 * @route   PUT /api/proposals/:id
 * @desc    Update proposal
 * @access  Private (Owner or Superadmin)
 */
router.put('/:id', authenticate, validateObjectId('id'), updateProposal);

/**
 * @route   DELETE /api/proposals/:id
 * @desc    Delete proposal
 * @access  Private (Owner or Superadmin)
 */
router.delete('/:id', authenticate, validateObjectId('id'), deleteProposal);

/**
 * @route   POST /api/proposals/:id/responses
 * @desc    Add vendor response to proposal
 * @access  Private (Vendors only)
 */
router.post('/:id/responses', authenticate, validateObjectId('id'), addResponse);

/**
 * @route   PUT /api/proposals/:proposalId/responses/:responseId
 * @desc    Update response status (accept/reject)
 * @access  Private (Proposal Owner or Superadmin)
 */
router.put('/:proposalId/responses/:responseId', 
  authenticate, 
  validateObjectId('proposalId'),
  validateObjectId('responseId'),
  updateResponseStatus
);

module.exports = router;
