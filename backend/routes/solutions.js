/**
 * Solution Routes
 * Handles all solution-related endpoints
 */

const express = require('express');
const router = express.Router();
const {
  getSolutions,
  getSolution,
  createSolution,
  updateSolution,
  deleteSolution,
  getFeaturedSolutions,
  getSolutionsByCategory,
  searchSolutions,
  getRecommendations,
  toggleLike,
  getSolutionStats,
  getDraftSolutions,
  approveSolution,
  getAdminStats
} = require('../controllers/solutionController');

const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const {
  validateSolutionCreation,
  validatePagination,
  validateAdminDrafts,
  validateSearch,
  validateObjectId
} = require('../middleware/validation');

/**
 * @route   GET /api/solutions
 * @desc    Get all solutions with filtering and pagination
 * @access  Public
 */
router.get('/', validatePagination, optionalAuth, getSolutions);

/**
 * @route   GET /api/solutions/featured
 * @desc    Get featured solutions
 * @access  Public
 */
router.get('/featured', getFeaturedSolutions);

/**
 * @route   GET /api/solutions/search
 * @desc    Search solutions with advanced filtering
 * @access  Public
 */
router.get('/search', validateSearch, validatePagination, searchSolutions);

/**
 * @route   GET /api/solutions/recommendations
 * @desc    Get personalized solution recommendations
 * @access  Private
 */
router.get('/recommendations', authenticate, getRecommendations);

/**
 * @route   GET /api/solutions/category/:category
 * @desc    Get solutions by category
 * @access  Public
 */
router.get('/category/:category', validatePagination, getSolutionsByCategory);

/**
 * @route   GET /api/solutions/:id
 * @desc    Get single solution by ID or slug
 * @access  Public
 */
router.get('/:id', validateObjectId('id'), getSolution);

/**
 * @route   GET /api/solutions/:id/stats
 * @desc    Get solution statistics and reviews
 * @access  Public
 */
router.get('/:id/stats', validateObjectId('id'), getSolutionStats);

/**
 * @route   POST /api/solutions
 * @desc    Create new solution
 * @access  Private (Vendors and Superadmins)
 */
router.post('/', authenticate, authorize('vendor', 'superadmin'), validateSolutionCreation, createSolution);

/**
 * @route   PUT /api/solutions/:id
 * @desc    Update solution
 * @access  Private (Owner or Superadmin)
 */
router.put('/:id', authenticate, validateObjectId('id'), updateSolution);

/**
 * @route   DELETE /api/solutions/:id
 * @desc    Delete solution
 * @access  Private (Owner or Superadmin)
 */
router.delete('/:id', authenticate, validateObjectId('id'), deleteSolution);

/**
 * @route   POST /api/solutions/:id/like
 * @desc    Like or unlike a solution
 * @access  Private
 */
router.post('/:id/like', authenticate, validateObjectId('id'), toggleLike);

/**
 * @route   POST /api/solutions/:id/contact
 * @desc    Contact vendor about a solution
 * @access  Private
 */
router.post('/:id/contact', authenticate, validateObjectId('id'), async (req, res) => {
  try {
    const { name, email, company, message } = req.body;
    const solutionId = req.params.id;
    const userId = req.user.id;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required'
      });
    }

    // Here you would typically:
    // 1. Save the contact request to database
    // 2. Send email notification to vendor
    // 3. Send confirmation email to user
    
    // For now, just return success
    res.json({
      success: true,
      message: 'Contact request sent successfully'
    });
  } catch (error) {
    console.error('Error processing contact request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send contact request'
    });
  }
});

/**
 * @route   GET /api/solutions/admin/drafts
 * @desc    Get all draft solutions (Admin only)
 * @access  Private (Superadmin only)
 */
router.get('/admin/drafts', authenticate, authorize('superadmin'), validateAdminDrafts, getDraftSolutions);

/**
 * @route   GET /api/solutions/admin/stats
 * @desc    Get admin statistics
 * @access  Private (Superadmin only)
 */
router.get('/admin/stats', authenticate, authorize('superadmin'), getAdminStats);

/**
 * @route   PUT /api/solutions/:id/approve
 * @desc    Approve or reject a solution (Superadmin only)
 * @access  Private (Superadmin only)
 */
router.put('/:id/approve', authenticate, authorize('superadmin'), validateObjectId('id'), approveSolution);

module.exports = router;
