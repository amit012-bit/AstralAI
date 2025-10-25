/**
 * Query Controller
 * Handles customer queries and AI-powered solution matching
 */

const Query = require('../models/Query');
const Solution = require('../models/Solution');
const Company = require('../models/Company');
const { AppError, catchAsync } = require('../middleware/errorHandler');

/**
 * Calculate similarity score between query and solution
 * @param {Object} query - Query object
 * @param {Object} solution - Solution object
 * @returns {number} Similarity score (0-100)
 */
const calculateSimilarityScore = (query, solution) => {
  let score = 0;
  let maxScore = 0;

  // Category match (30 points)
  maxScore += 30;
  if (query.category === solution.category) {
    score += 30;
  } else if (query.category && solution.tags.includes(query.category.toLowerCase())) {
    score += 20;
  }

  // Industry match (25 points)
  maxScore += 25;
  if (query.industry === solution.industry) {
    score += 25;
  } else if (query.industry && solution.tags.includes(query.industry.toLowerCase())) {
    score += 15;
  }

  // Tag overlap (20 points)
  maxScore += 20;
  if (query.tags && solution.tags) {
    const queryTags = query.tags.map(tag => tag.toLowerCase());
    const solutionTags = solution.tags.map(tag => tag.toLowerCase());
    const commonTags = queryTags.filter(tag => solutionTags.includes(tag));
    
    if (commonTags.length > 0) {
      score += Math.min(20, (commonTags.length / Math.max(queryTags.length, solutionTags.length)) * 20);
    }
  }

  // Budget compatibility (15 points)
  maxScore += 15;
  if (query.requirements && query.requirements.budget && solution.pricing) {
    const queryMaxBudget = query.requirements.budget.max;
    const solutionPrice = solution.pricing.price?.amount;
    
    if (solution.pricing.model === 'free') {
      score += 15;
    } else if (queryMaxBudget && solutionPrice && solutionPrice <= queryMaxBudget) {
      score += 15;
    } else if (solution.pricing.model === 'contact' || solution.pricing.model === 'custom') {
      score += 10;
    }
  }

  // Deployment type match (10 points)
  maxScore += 10;
  if (query.requirements && query.requirements.deployment && solution.deployment) {
    if (query.requirements.deployment === solution.deployment.type || 
        query.requirements.deployment === 'any') {
      score += 10;
    }
  }

  return Math.round((score / maxScore) * 100);
};

/**
 * Find matching solutions for a query
 * @param {Object} query - Query object
 * @returns {Array} Array of matching solutions with scores
 */
const findMatchingSolutions = async (query) => {
  // Get potential solutions based on category and industry
  const filter = {
    status: 'approved',
    isActive: true,
    $or: [
      { category: query.category },
      { industry: query.industry },
      { tags: { $in: query.tags || [] } }
    ]
  };

  // Add budget filter if specified
  if (query.requirements && query.requirements.budget && query.requirements.budget.max) {
    filter.$or.push({
      $or: [
        { 'pricing.model': 'free' },
        { 'pricing.price.amount': { $lte: query.requirements.budget.max } },
        { 'pricing.model': { $in: ['contact', 'custom'] } }
      ]
    });
  }

  const solutions = await Solution.find(filter)
    .populate('companyId', 'name logo industry isVerified')
    .select('-__v');

  // Calculate similarity scores and filter
  const matches = solutions
    .map(solution => ({
      solution,
      relevanceScore: calculateSimilarityScore(query, solution)
    }))
    .filter(match => match.relevanceScore >= 30) // Minimum 30% relevance
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10); // Top 10 matches

  return matches;
};

/**
 * Create a new query
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const createQuery = catchAsync(async (req, res, next) => {
  const queryData = {
    ...req.body,
    customerId: req.user._id
  };

  const query = await Query.create(queryData);

  // Find matching solutions
  const matches = await findMatchingSolutions(query);

  // Add matches to query
  for (const match of matches) {
    await query.addMatchedSolution(match.solution._id, match.relevanceScore);
  }

  // Populate customer information
  await query.populate('customerId', 'firstName lastName companyId');

  res.status(201).json({
    success: true,
    message: 'Query created successfully',
    query: query.getPublicProfile(),
    matchedSolutions: matches.map(match => ({
      solution: match.solution.getPublicProfile(),
      relevanceScore: match.relevanceScore
    }))
  });
});

/**
 * Get all queries with filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getQueries = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    category,
    industry,
    status,
    customerId,
    isPublic
  } = req.query;

  // Build filter object
  const filter = {};

  if (category) filter.category = category;
  if (industry) filter.industry = industry;
  if (status) filter.status = status;
  if (customerId) filter.customerId = customerId;
  if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

  // Non-admin users can only see their own queries or public queries
  if (req.user.role !== 'superadmin') {
    if (req.user.role === 'customer') {
      filter.$or = [
        { customerId: req.user._id },
        { isPublic: true }
      ];
    } else if (req.user.role === 'vendor') {
      filter.isPublic = true; // Vendors can only see public queries
    }
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const queries = await Query.find(filter)
    .populate('customerId', 'firstName lastName companyId')
    .populate('matchedSolutions.solutionId', 'title shortDescription companyId pricing')
    .sort({ postedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('-__v');

  const total = await Query.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: queries.length,
    total,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    queries: queries.map(query => query.getPublicProfile())
  });
});

/**
 * Get single query by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getQuery = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const query = await Query.findById(id)
    .populate('customerId', 'firstName lastName companyId avatar')
    .populate('matchedSolutions.solutionId', 'title shortDescription companyId pricing images')
    .populate({
      path: 'matchedSolutions.solutionId',
      populate: {
        path: 'companyId',
        select: 'name logo industry'
      }
    })
    .select('-__v');

  if (!query) {
    return next(new AppError('Query not found', 404));
  }

  // Check access permissions
  if (req.user.role !== 'superadmin') {
    if (req.user.role === 'customer' && query.customerId._id.toString() !== req.user._id.toString()) {
      if (!query.isPublic) {
        return next(new AppError('Not authorized to view this query', 403));
      }
    } else if (req.user.role === 'vendor' && !query.isPublic) {
      return next(new AppError('Not authorized to view this query', 403));
    }
  }

  res.status(200).json({
    success: true,
    query: query.getPublicProfile()
  });
});

/**
 * Update query
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateQuery = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const query = await Query.findById(id);

  if (!query) {
    return next(new AppError('Query not found', 404));
  }

  // Check if user can update this query
  if (req.user.role !== 'superadmin' && query.customerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to update this query', 403));
  }

  // Update query
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      query[key] = req.body[key];
    }
  });

  await query.save();

  res.status(200).json({
    success: true,
    message: 'Query updated successfully',
    query: query.getPublicProfile()
  });
});

/**
 * Delete query
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const deleteQuery = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const query = await Query.findById(id);

  if (!query) {
    return next(new AppError('Query not found', 404));
  }

  // Check if user can delete this query
  if (req.user.role !== 'superadmin' && query.customerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to delete this query', 403));
  }

  await Query.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Query deleted successfully'
  });
});

/**
 * Get active queries by category and industry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getActiveQueries = catchAsync(async (req, res, next) => {
  const { category, industry, limit = 10 } = req.query;

  const queries = await Query.findActiveQueries(category, industry)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: queries.length,
    queries: queries.map(query => query.getPublicProfile())
  });
});

/**
 * Mark solution as viewed by customer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const markSolutionViewed = catchAsync(async (req, res, next) => {
  const { queryId, solutionId } = req.params;

  const query = await Query.findById(queryId);

  if (!query) {
    return next(new AppError('Query not found', 404));
  }

  // Check if user can access this query
  if (req.user.role !== 'superadmin' && query.customerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to access this query', 403));
  }

  await query.markSolutionViewed(solutionId);

  res.status(200).json({
    success: true,
    message: 'Solution marked as viewed'
  });
});

/**
 * Contact vendor about a solution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const contactVendor = catchAsync(async (req, res, next) => {
  const { queryId, solutionId } = req.params;
  const { message } = req.body;

  const query = await Query.findById(queryId);

  if (!query) {
    return next(new AppError('Query not found', 404));
  }

  // Check if user can access this query
  if (req.user.role !== 'superadmin' && query.customerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to access this query', 403));
  }

  // Find the matched solution
  const matchedSolution = query.matchedSolutions.find(
    match => match.solutionId.toString() === solutionId
  );

  if (!matchedSolution) {
    return next(new AppError('Solution not found in query matches', 404));
  }

  // Mark as contacted
  matchedSolution.customerContacted = true;
  await query.save();

  // Increment solution inquiries
  await Solution.updateMetric(solutionId, 'inquiries', 1);

  // In a real application, you would:
  // 1. Send notification to vendor
  // 2. Create a conversation/chat thread
  // 3. Send email notification

  res.status(200).json({
    success: true,
    message: 'Vendor contacted successfully',
    contactInfo: {
      queryId,
      solutionId,
      message,
      contactedAt: new Date()
    }
  });
});

/**
 * Resolve query with selected solution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const resolveQuery = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { selectedSolution, satisfaction, resolutionNotes } = req.body;

  const query = await Query.findById(id);

  if (!query) {
    return next(new AppError('Query not found', 404));
  }

  // Check if user can resolve this query
  if (req.user.role !== 'superadmin' && query.customerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to resolve this query', 403));
  }

  // Update query resolution
  query.status = 'closed';
  query.resolution = {
    selectedSolution,
    satisfaction,
    resolutionNotes,
    resolvedAt: new Date()
  };

  await query.save();

  res.status(200).json({
    success: true,
    message: 'Query resolved successfully',
    query: query.getPublicProfile()
  });
});

/**
 * Get query statistics for dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getQueryStats = catchAsync(async (req, res, next) => {
  const stats = {};

  if (req.user.role === 'superadmin') {
    // Admin can see all stats
    stats.totalQueries = await Query.countDocuments();
    stats.activeQueries = await Query.countDocuments({ status: 'active' });
    stats.resolvedQueries = await Query.countDocuments({ status: 'closed' });
    stats.expiredQueries = await Query.countDocuments({ expiresAt: { $lt: new Date() } });
  } else if (req.user.role === 'customer') {
    // Customer can see their own stats
    const customerFilter = { customerId: req.user._id };
    stats.totalQueries = await Query.countDocuments(customerFilter);
    stats.activeQueries = await Query.countDocuments({ ...customerFilter, status: 'active' });
    stats.resolvedQueries = await Query.countDocuments({ ...customerFilter, status: 'closed' });
  }

  res.status(200).json({
    success: true,
    stats
  });
});

module.exports = {
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
};
