/**
 * Query Routes
 * Handles all query-related endpoints
 */

const express = require('express');
const router = express.Router();
const {
  createQuery,
  getQueries,
  getQuery,
  updateQuery,
  deleteQuery,
  getActiveQueries,
  markSolutionViewed,
  contactVendor,
  resolveQuery,
  getQueryStats
} = require('../controllers/queryController');

const { authenticate, authorize } = require('../middleware/auth');
const {
  validateQueryCreation,
  validatePagination,
  validateObjectId
} = require('../middleware/validation');

/**
 * @route   GET /api/queries/stats
 * @desc    Get query statistics for dashboard
 * @access  Private
 */
router.get('/stats', authenticate, getQueryStats);

/**
 * @route   GET /api/queries/active
 * @desc    Get active public queries
 * @access  Public
 */
router.get('/active', getActiveQueries);

/**
 * @route   GET /api/queries
 * @desc    Get all queries with filtering
 * @access  Private
 */
router.get('/', authenticate, validatePagination, getQueries);

/**
 * @route   GET /api/queries/:id
 * @desc    Get single query by ID
 * @access  Private
 */
router.get('/:id', authenticate, validateObjectId('id'), getQuery);

/**
 * @route   POST /api/queries
 * @desc    Create new query
 * @access  Private (Customers only)
 */
router.post('/', authenticate, authorize('customer'), validateQueryCreation, createQuery);

/**
 * @route   PUT /api/queries/:id
 * @desc    Update query
 * @access  Private (Owner or Superadmin)
 */
router.put('/:id', authenticate, validateObjectId('id'), updateQuery);

/**
 * @route   DELETE /api/queries/:id
 * @desc    Delete query
 * @access  Private (Owner or Superadmin)
 */
router.delete('/:id', authenticate, validateObjectId('id'), deleteQuery);

/**
 * @route   POST /api/queries/:queryId/solutions/:solutionId/view
 * @desc    Mark solution as viewed by customer
 * @access  Private
 */
router.post('/:queryId/solutions/:solutionId/view', 
  authenticate, 
  validateObjectId('queryId'), 
  validateObjectId('solutionId'), 
  markSolutionViewed
);

/**
 * @route   POST /api/queries/:queryId/solutions/:solutionId/contact
 * @desc    Contact vendor about a solution
 * @access  Private
 */
router.post('/:queryId/solutions/:solutionId/contact', 
  authenticate, 
  validateObjectId('queryId'), 
  validateObjectId('solutionId'), 
  contactVendor
);

/**
 * @route   POST /api/queries/:id/resolve
 * @desc    Resolve query with selected solution
 * @access  Private (Owner or Superadmin)
 */
router.post('/:id/resolve', 
  authenticate, 
  validateObjectId('id'), 
  resolveQuery
);

module.exports = router;
