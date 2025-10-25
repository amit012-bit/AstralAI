/**
 * Solution Controller
 * Handles AI solution-related operations including CRUD, search, and matching
 */

const Solution = require('../models/Solution');
const Company = require('../models/Company');
const Review = require('../models/Review');
const Query = require('../models/Query');
const { AppError, catchAsync } = require('../middleware/errorHandler');

/**
 * Get all solutions with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getSolutions = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    category,
    industry,
    companyId,
    vendorId,
    search,
    sort = 'newest',
    minRating,
    maxPrice,
    pricingModel,
    deploymentType
  } = req.query;

  // Build filter object
  const filter = { status: 'approved', isActive: true };

  if (category) filter.category = category;
  if (industry) filter.industry = industry;
  if (companyId) filter.companyId = companyId;
  if (vendorId) filter.vendorId = vendorId;
  if (minRating) filter['rating.average'] = { $gte: parseFloat(minRating) };
  if (pricingModel) filter['pricing.model'] = pricingModel;
  if (deploymentType) filter['deployment.type'] = deploymentType;

  // Add text search if provided
  if (search) {
    filter.$text = { $search: search };
  }

  // Build sort object
  let sortObj = {};
  switch (sort) {
    case 'newest':
      sortObj = { createdAt: -1 };
      break;
    case 'oldest':
      sortObj = { createdAt: 1 };
      break;
    case 'rating':
      sortObj = { 'rating.average': -1 };
      break;
    case 'views':
      sortObj = { views: -1 };
      break;
    case 'title':
      sortObj = { title: 1 };
      break;
    default:
      sortObj = { createdAt: -1 };
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const solutions = await Solution.find(filter)
    .populate('companyId', 'name logo industry isVerified')
    .populate('vendorId', 'firstName lastName avatar')
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-__v');

  const total = await Solution.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: solutions.length,
    total,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    solutions: solutions.map(solution => solution.getPublicProfile())
  });
});

/**
 * Get single solution by ID or slug
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getSolution = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Check if ID is a valid ObjectId or slug
  const solution = await Solution.findOne({
    $or: [
      { _id: id },
      { slug: id }
    ]
  })
    .populate('companyId', 'name logo industry website isVerified')
    .populate('vendorId', 'firstName lastName avatar email')
    .select('-__v');

  if (!solution) {
    return next(new AppError('Solution not found', 404));
  }

  // Increment view count
  await Solution.updateMetric(solution._id, 'views', 1);

  res.status(200).json({
    success: true,
    solution: solution.getPublicProfile()
  });
});

/**
 * Create new solution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const createSolution = catchAsync(async (req, res, next) => {
  // Validate that user is a vendor or superadmin
  if (req.user.role !== 'vendor' && req.user.role !== 'superadmin') {
    return next(new AppError('Only vendors and superadmins can create solutions', 403));
  }

  // Validate that user has a company (for vendors) or allow superadmins without company
  if (req.user.role === 'vendor' && !req.user.companyId) {
    return next(new AppError('Vendor must be associated with a company', 400));
  }
  
  // Prepare solution data
  const solutionData = {
    ...req.body,
    vendorId: req.user._id
  };

  // Handle companyId based on user role
  if (req.user.role === 'vendor') {
    solutionData.companyId = req.user.companyId;
  } else if (req.user.role === 'superadmin') {
    // For superadmins, use provided companyId or set to null
    solutionData.companyId = req.body.companyId || null;
  }

  const solution = await Solution.create(solutionData);

  // Update company solution count (only if companyId exists)
  if (solutionData.companyId) {
    await Company.updateSolutionCount(solutionData.companyId, 1);
  }

  // Populate related data
  await solution.populate('companyId', 'name logo industry');
  await solution.populate('vendorId', 'firstName lastName avatar');

  res.status(201).json({
    success: true,
    message: 'Solution created successfully',
    solution: solution.getPublicProfile()
  });
});

/**
 * Update solution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateSolution = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const solution = await Solution.findById(id);

  if (!solution) {
    return next(new AppError('Solution not found', 404));
  }

  // Check if user can update this solution
  if (req.user.role !== 'superadmin' && solution.vendorId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to update this solution', 403));
  }

  // Update solution
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      solution[key] = req.body[key];
    }
  });

  await solution.save();

  // Populate related data
  await solution.populate('companyId', 'name logo industry');
  await solution.populate('vendorId', 'firstName lastName avatar');

  res.status(200).json({
    success: true,
    message: 'Solution updated successfully',
    solution: solution.getPublicProfile()
  });
});

/**
 * Delete solution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const deleteSolution = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const solution = await Solution.findById(id);

  if (!solution) {
    return next(new AppError('Solution not found', 404));
  }

  // Check if user can delete this solution
  if (req.user.role !== 'superadmin' && solution.vendorId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to delete this solution', 403));
  }

  // Soft delete - mark as inactive
  solution.isActive = false;
  await solution.save();

  // Update company solution count
  await Company.updateSolutionCount(solution.companyId, -1);

  res.status(200).json({
    success: true,
    message: 'Solution deleted successfully'
  });
});

/**
 * Get featured solutions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getFeaturedSolutions = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const solutions = await Solution.find({
    status: 'approved',
    isActive: true,
    isFeatured: true
  })
    .populate('companyId', 'name logo industry isVerified')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select('-__v');

  res.status(200).json({
    success: true,
    count: solutions.length,
    solutions: solutions.map(solution => solution.getPublicProfile())
  });
});

/**
 * Get solutions by category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getSolutionsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const { limit = 10 } = req.query;

  const solutions = await Solution.find({
    category,
    status: 'approved',
    isActive: true
  })
    .populate('companyId', 'name logo industry isVerified')
    .sort({ 'rating.average': -1, views: -1 })
    .limit(parseInt(limit))
    .select('-__v');

  res.status(200).json({
    success: true,
    count: solutions.length,
    category,
    solutions: solutions.map(solution => solution.getPublicProfile())
  });
});

/**
 * Search solutions with advanced filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const searchSolutions = catchAsync(async (req, res, next) => {
  const {
    q,
    category,
    industry,
    tags,
    minRating,
    maxPrice,
    pricingModel,
    deploymentType,
    companySize,
    page = 1,
    limit = 10,
    sort = 'relevance'
  } = req.query;

  // Build search query
  let searchQuery = {
    status: 'approved',
    isActive: true
  };

  // Text search
  if (q) {
    searchQuery.$text = { $search: q };
  }

  // Category and industry filters
  if (category) searchQuery.category = category;
  if (industry) searchQuery.industry = industry;

  // Tag filters
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    searchQuery.tags = { $in: tagArray };
  }

  // Rating filter
  if (minRating) {
    searchQuery['rating.average'] = { $gte: parseFloat(minRating) };
  }

  // Price filter
  if (maxPrice) {
    searchQuery.$or = [
      { 'pricing.model': 'free' },
      { 'pricing.price.amount': { $lte: parseFloat(maxPrice) } }
    ];
  }

  // Pricing model filter
  if (pricingModel) {
    searchQuery['pricing.model'] = pricingModel;
  }

  // Deployment type filter
  if (deploymentType) {
    searchQuery['deployment.type'] = deploymentType;
  }

  // Build sort object
  let sortObj = {};
  if (q && sort === 'relevance') {
    sortObj = { score: { $meta: 'textScore' } };
  } else {
    switch (sort) {
      case 'rating':
        sortObj = { 'rating.average': -1 };
        break;
      case 'price-low':
        sortObj = { 'pricing.price.amount': 1 };
        break;
      case 'price-high':
        sortObj = { 'pricing.price.amount': -1 };
        break;
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      default:
        sortObj = { 'rating.average': -1, views: -1 };
    }
  }

  // Execute search with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  let query = Solution.find(searchQuery)
    .populate('companyId', 'name logo industry isVerified')
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  if (q && sort === 'relevance') {
    query = query.select({ score: { $meta: 'textScore' } });
  }

  const solutions = await query.select('-__v');
  const total = await Solution.countDocuments(searchQuery);

  res.status(200).json({
    success: true,
    count: solutions.length,
    total,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    searchQuery: { q, category, industry, tags, minRating, maxPrice, pricingModel, deploymentType },
    solutions: solutions.map(solution => solution.getPublicProfile())
  });
});

/**
 * Get solution recommendations for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getRecommendations = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  // Get user's interests and industry
  const user = req.user;
  const recommendations = [];

  // If user has specific interests
  if (user.interests && user.interests.length > 0) {
    const interestSolutions = await Solution.find({
      tags: { $in: user.interests },
      status: 'approved',
      isActive: true,
      _id: { $nin: user.viewedSolutions || [] }
    })
      .populate('companyId', 'name logo industry isVerified')
      .sort({ 'rating.average': -1, views: -1 })
      .limit(parseInt(limit) / 2)
      .select('-__v');

    recommendations.push(...interestSolutions);
  }

  // If user has industry preference
  if (user.industry) {
    const industrySolutions = await Solution.find({
      industry: user.industry,
      status: 'approved',
      isActive: true,
      _id: { $nin: recommendations.map(s => s._id) }
    })
      .populate('companyId', 'name logo industry isVerified')
      .sort({ 'rating.average': -1, views: -1 })
      .limit(parseInt(limit) / 2)
      .select('-__v');

    recommendations.push(...industrySolutions);
  }

  // If not enough recommendations, add popular solutions
  if (recommendations.length < parseInt(limit)) {
    const popularSolutions = await Solution.find({
      status: 'approved',
      isActive: true,
      _id: { $nin: recommendations.map(s => s._id) }
    })
      .populate('companyId', 'name logo industry isVerified')
      .sort({ views: -1, 'rating.average': -1 })
      .limit(parseInt(limit) - recommendations.length)
      .select('-__v');

    recommendations.push(...popularSolutions);
  }

  res.status(200).json({
    success: true,
    count: recommendations.length,
    recommendations: recommendations.map(solution => solution.getPublicProfile())
  });
});

/**
 * Like/unlike a solution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const toggleLike = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const solution = await Solution.findById(id);

  if (!solution) {
    return next(new AppError('Solution not found', 404));
  }

  // For now, we'll just increment/decrement likes
  // In a real app, you'd track individual user likes
  const action = req.body.action; // 'like' or 'unlike'
  
  if (action === 'like') {
    await Solution.updateMetric(id, 'likes', 1);
  } else if (action === 'unlike') {
    await Solution.updateMetric(id, 'likes', -1);
  }

  res.status(200).json({
    success: true,
    message: `Solution ${action}d successfully`
  });
});

/**
 * Get solution statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getSolutionStats = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const solution = await Solution.findById(id);

  if (!solution) {
    return next(new AppError('Solution not found', 404));
  }

  // Get rating statistics
  const ratingStats = await Review.calculateAverageRating(id);

  // Get recent reviews
  const recentReviews = await Review.findApprovedBySolution(id, 5);

  res.status(200).json({
    success: true,
    stats: {
      views: solution.views,
      likes: solution.likes,
      bookmarks: solution.bookmarks,
      inquiries: solution.inquiries,
      rating: ratingStats,
      recentReviews
    }
  });
});

/**
 * Get all draft solutions (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getDraftSolutions = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    status = 'draft',
    search
  } = req.query;

  // Build filter object
  const filter = { status };
  if (search) {
    filter.$text = { $search: search };
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const solutions = await Solution.find(filter)
    .populate('companyId', 'name logo industry isVerified')
    .populate('vendorId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('-__v');

  const total = await Solution.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: solutions.length,
    total,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    solutions: solutions.map(solution => solution.getPublicProfile())
  });
});

/**
 * Approve a solution (Superadmin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const approveSolution = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status = 'approved', notes } = req.body;

  const solution = await Solution.findById(id);
  if (!solution) {
    return next(new AppError('Solution not found', 404));
  }

  // Update solution status
  solution.status = status;
  if (notes) {
    solution.adminNotes = notes;
  }
  solution.approvedAt = new Date();
  solution.approvedBy = req.user._id;

  await solution.save();

  res.status(200).json({
    success: true,
    message: `Solution ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
    solution: solution.getPublicProfile()
  });
});

/**
 * Get solution statistics for admin dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getAdminStats = catchAsync(async (req, res, next) => {
  const [
    totalSolutions,
    approvedSolutions,
    draftSolutions,
    pendingSolutions,
    rejectedSolutions,
    totalCompanies,
    totalVendors
  ] = await Promise.all([
    Solution.countDocuments(),
    Solution.countDocuments({ status: 'approved' }),
    Solution.countDocuments({ status: 'draft' }),
    Solution.countDocuments({ status: 'pending' }),
    Solution.countDocuments({ status: 'rejected' }),
    Company.countDocuments(),
    Solution.distinct('vendorId').then(vendors => vendors.length)
  ]);

  res.status(200).json({
    success: true,
    stats: {
      solutions: {
        total: totalSolutions,
        approved: approvedSolutions,
        draft: draftSolutions,
        pending: pendingSolutions,
        rejected: rejectedSolutions
      },
      companies: totalCompanies,
      vendors: totalVendors
    }
  });
});

module.exports = {
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
};
