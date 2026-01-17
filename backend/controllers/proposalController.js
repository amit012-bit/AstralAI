/**
 * Proposal Controller
 * Handles proposal creation, viewing, and vendor responses
 */

const Proposal = require('../models/Proposal');
const User = require('../models/User');
const Solution = require('../models/Solution');
const Vendor = require('../models/Vendor');
const Company = require('../models/Company');
const { AppError, catchAsync } = require('../middleware/errorHandler');

/**
 * Create a new proposal
 * @route POST /api/proposals
 * @access Private (Customers and Vendors)
 */
const createProposal = catchAsync(async (req, res, next) => {
  const user = req.user;
  
  // Determine creator type based on user role
  const creatorType = user.role === 'customer' ? 'customer' : 'vendor';
  
  const proposalData = {
    ...req.body,
    createdBy: user._id,
    creatorType,
    contactName: req.body.contactName || `${user.firstName} ${user.lastName}`,
    contactEmail: req.body.contactEmail || user.email,
    contactPhone: req.body.contactPhone || user.phone,
    publishedAt: req.body.status === 'active' ? new Date() : null
  };

  const proposal = await Proposal.create(proposalData);

  // Populate creator information
  await proposal.populate('createdBy', 'firstName lastName email');

  res.status(201).json({
    success: true,
    message: 'Proposal created successfully',
    proposal: proposal.getPublicProfile()
  });
});

/**
 * Get all proposals with filtering
 * @route GET /api/proposals
 * @access Private
 */
const getProposals = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 12,
    category,
    industry,
    status,
    creatorType,
    createdBy
  } = req.query;

  const filter = {};

  if (category && category !== 'All Categories') filter.category = category;
  if (industry && industry !== 'All Industries') filter.industry = industry;
  if (status && status !== 'All Status') filter.status = status;
  if (creatorType) filter.creatorType = creatorType;
  if (createdBy) filter.createdBy = createdBy;

  // Build $and array for complex filters
  const andConditions = [];

  // Non-admin users see different views
  // Ensure req.user exists (should be set by auth middleware)
  if (req.user && req.user.role !== 'superadmin') {
    if (req.user.role === 'customer') {
      // Customers see their own proposals and all active vendor proposals
      andConditions.push({
        $or: [
          { createdBy: req.user._id },
          { creatorType: 'vendor', status: 'active' }
        ]
      });
    } else if (req.user.role === 'vendor') {
      // Vendors see customer proposals and their own proposals
      andConditions.push({
        $or: [
          { creatorType: 'customer', status: 'active' },
          { createdBy: req.user._id }
        ]
      });
    }
  }

  // Exclude expired proposals unless specifically requested
  if (status !== 'cancelled' && status !== 'completed') {
    andConditions.push({
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    });
  }

  // Combine all filters
  if (andConditions.length > 0) {
    filter.$and = andConditions;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const proposals = await Proposal.find(filter)
    .populate('createdBy', 'firstName lastName email')
    .populate('responses.vendorId', 'firstName lastName email')
    .populate('responses.solutionId', 'title shortDescription')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('-__v');

  const total = await Proposal.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: proposals.length,
    total,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    proposals: proposals.map(proposal => proposal.getPublicProfile())
  });
});

/**
 * Get single proposal by ID
 * @route GET /api/proposals/:id
 * @access Private
 */
const getProposal = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const proposal = await Proposal.findById(id)
    .populate('createdBy', 'firstName lastName email phone')
    .populate('responses.vendorId', 'firstName lastName email')
    .populate('responses.solutionId', 'title shortDescription description pricing images')
    .select('-__v');

  if (!proposal) {
    return next(new AppError('Proposal not found', 404));
  }

  // Increment views
  await proposal.incrementViews();

  // Check access permissions
  if (req.user.role !== 'superadmin') {
    const isOwner = proposal.createdBy._id.toString() === req.user._id.toString();
    
    if (req.user.role === 'customer') {
      // Customers can see their own proposals and active vendor proposals
      if (!isOwner && (proposal.creatorType !== 'vendor' || proposal.status !== 'active')) {
        return next(new AppError('Not authorized to view this proposal', 403));
      }
    } else if (req.user.role === 'vendor') {
      // Vendors can see customer proposals and their own proposals
      if (!isOwner && (proposal.creatorType !== 'customer' || proposal.status !== 'active')) {
        return next(new AppError('Not authorized to view this proposal', 403));
      }
    }
  }

  res.status(200).json({
    success: true,
    proposal: proposal.getPublicProfile()
  });
});

/**
 * Update proposal
 * @route PUT /api/proposals/:id
 * @access Private (Owner or Superadmin)
 */
const updateProposal = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const proposal = await Proposal.findById(id);

  if (!proposal) {
    return next(new AppError('Proposal not found', 404));
  }

  // Check authorization
  if (req.user.role !== 'superadmin' && proposal.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to update this proposal', 403));
  }

  // Update fields
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined && key !== 'responses') {
      proposal[key] = req.body[key];
    }
  });

  // Update publishedAt if status changed to active
  if (req.body.status === 'active' && proposal.status !== 'active') {
    proposal.publishedAt = new Date();
  }

  await proposal.save();

  res.status(200).json({
    success: true,
    message: 'Proposal updated successfully',
    proposal: proposal.getPublicProfile()
  });
});

/**
 * Delete proposal
 * @route DELETE /api/proposals/:id
 * @access Private (Owner or Superadmin)
 */
const deleteProposal = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const proposal = await Proposal.findById(id);

  if (!proposal) {
    return next(new AppError('Proposal not found', 404));
  }

  // Check authorization
  if (req.user.role !== 'superadmin' && proposal.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to delete this proposal', 403));
  }

  await Proposal.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Proposal deleted successfully'
  });
});

/**
 * Add vendor response to proposal
 * @route POST /api/proposals/:id/responses
 * @access Private (Vendors only)
 */
const addResponse = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;

  // Only vendors can add responses
  if (user.role !== 'vendor' && user.role !== 'superadmin') {
    return next(new AppError('Only vendors can submit responses', 403));
  }

  const proposal = await Proposal.findById(id);

  if (!proposal) {
    return next(new AppError('Proposal not found', 404));
  }

  // Only customer proposals can receive vendor responses
  if (proposal.creatorType !== 'customer') {
    return next(new AppError('Only customer proposals can receive vendor responses', 400));
  }

  // Check if proposal is active
  if (proposal.status !== 'active') {
    return next(new AppError('This proposal is not accepting responses', 400));
  }

  // Get vendor information - check Vendor document first, then fallback to User/Company
  let vendor = await Vendor.findOne({ userId: user._id });
  let vendorCompany = '';
  
  // If no Vendor document exists, check if user has a company (vendor with companyId)
  if (!vendor && user.role === 'vendor') {
    if (user.companyId) {
      const company = await Company.findById(user.companyId);
      if (company) {
        vendorCompany = company.name || '';
      } else {
        // User has companyId but Company doesn't exist - this is a data integrity issue
        // But we'll still allow submission, just without company name
        console.warn(`User ${user._id} has companyId ${user.companyId} but Company not found`);
      }
    }
    // If vendor doesn't have companyId, that's fine - they can still submit proposals
    // The Vendor document check is only for the detailed questionnaire data
  } else if (!vendor && user.role !== 'vendor' && user.role !== 'superadmin') {
    return next(new AppError('Only vendors can submit proposal responses', 403));
  } else if (vendor) {
    // Use vendor document company name if available
    vendorCompany = vendor.companyName || '';
  }

  // Get vendor name
  const vendorName = `${user.firstName} ${user.lastName}`;

  const responseData = {
    vendorId: user._id,
    vendorName,
    vendorCompany,
    solutionId: req.body.solutionId || null,
    proposalText: req.body.proposalText,
    proposedPrice: req.body.proposedPrice,
    proposedTimeline: req.body.proposedTimeline,
    status: 'pending'
  };

  try {
    await proposal.addResponse(responseData);

    // Populate the new response
    await proposal.populate('responses.vendorId', 'firstName lastName email');
    if (responseData.solutionId) {
      await proposal.populate('responses.solutionId', 'title shortDescription');
    }

    const newResponse = proposal.responses[proposal.responses.length - 1];

    res.status(201).json({
      success: true,
      message: 'Response submitted successfully',
      response: newResponse
    });
  } catch (error) {
    if (error.message.includes('already submitted')) {
      return next(new AppError(error.message, 400));
    }
    throw error;
  }
});

/**
 * Update response status (accept/reject)
 * @route PUT /api/proposals/:proposalId/responses/:responseId
 * @access Private (Proposal Owner or Superadmin)
 */
const updateResponseStatus = catchAsync(async (req, res, next) => {
  const { proposalId, responseId } = req.params;
  const { status } = req.body;

  if (!['accepted', 'rejected', 'pending'].includes(status)) {
    return next(new AppError('Invalid status. Must be accepted, rejected, or pending', 400));
  }

  const proposal = await Proposal.findById(proposalId);

  if (!proposal) {
    return next(new AppError('Proposal not found', 404));
  }

  // Check authorization - only proposal owner can update response status
  if (req.user.role !== 'superadmin' && proposal.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to update this response', 403));
  }

  try {
    await proposal.updateResponseStatus(responseId, status);
    
    await proposal.populate('responses.vendorId', 'firstName lastName email');
    await proposal.populate('responses.solutionId', 'title shortDescription');

    const updatedResponse = proposal.responses.id(responseId);

    res.status(200).json({
      success: true,
      message: 'Response status updated successfully',
      response: updatedResponse
    });
  } catch (error) {
    if (error.message === 'Response not found') {
      return next(new AppError(error.message, 404));
    }
    throw error;
  }
});

/**
 * Update response content
 * @route PUT /api/proposals/:proposalId/responses/:responseId/update
 * @access Private (Response Owner or Superadmin)
 */
const updateResponse = catchAsync(async (req, res, next) => {
  const { proposalId, responseId } = req.params;
  const user = req.user;

  const proposal = await Proposal.findById(proposalId);

  if (!proposal) {
    return next(new AppError('Proposal not found', 404));
  }

  const response = proposal.responses.id(responseId);
  if (!response) {
    return next(new AppError('Response not found', 404));
  }

  // Check authorization - only the vendor who created the response can update it
  if (user.role !== 'superadmin' && response.vendorId.toString() !== user._id.toString()) {
    return next(new AppError('Not authorized to update this response', 403));
  }

  // Only allow updates if response is still pending or viewed (not shortlisted/rejected)
  if (response.status === 'shortlisted' || response.status === 'rejected') {
    return next(new AppError('Cannot update a response that has been shortlisted or rejected', 400));
  }

  try {
    const updateData = {
      solutionId: req.body.solutionId,
      proposalText: req.body.proposalText,
      proposedPrice: req.body.proposedPrice,
      proposedTimeline: req.body.proposedTimeline,
      caseStudyLink: req.body.caseStudyLink,
      attachments: req.body.attachments
    };

    await proposal.updateResponse(responseId, updateData);
    
    await proposal.populate('responses.vendorId', 'firstName lastName email');
    await proposal.populate('responses.solutionId', 'title shortDescription');

    const updatedResponse = proposal.responses.id(responseId);

    res.status(200).json({
      success: true,
      message: 'Response updated successfully',
      response: updatedResponse
    });
  } catch (error) {
    if (error.message === 'Response not found') {
      return next(new AppError(error.message, 404));
    }
    throw error;
  }
});

module.exports = {
  createProposal,
  getProposals,
  getProposal,
  updateProposal,
  deleteProposal,
  addResponse,
  updateResponseStatus,
  updateResponse
};
