/**
 * Proposal Model - Customer proposals and vendor responses
 * Handles customer RFP-style proposals and vendor solution submissions
 */

const mongoose = require('mongoose');

// Proposal schema definition
const proposalSchema = new mongoose.Schema({
  // Proposal information
  title: {
    type: String,
    required: [true, 'Proposal title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Proposal description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  
  // Creator information (can be customer or vendor)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorType: {
    type: String,
    enum: ['customer', 'vendor'],
    required: true
  },
  
  // Proposal categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Requirements
  requirements: {
    budget: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    timeline: {
      type: String,
      enum: ['immediate', '1-month', '3-months', '6-months', '1-year', 'flexible'],
      default: 'flexible'
    },
    deploymentPreference: {
      type: String,
      enum: ['cloud', 'on-premise', 'hybrid', 'any'],
      default: 'any'
    },
    requiredFeatures: [{
      type: String,
      trim: true
    }],
    preferredFeatures: [{
      type: String,
      trim: true
    }]
  },
  
  // Contact information
  contactName: {
    type: String,
    required: true,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  
  // Status and management
  status: {
    type: String,
    enum: ['draft', 'active', 'in_progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Vendor responses (solutions submitted to this proposal)
  responses: [{
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    vendorName: {
      type: String,
      required: true
    },
    vendorCompany: {
      type: String
    },
    solutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Solution'
    },
    proposalText: {
      type: String,
      required: true,
      maxlength: [5000, 'Proposal text cannot exceed 5000 characters']
    },
    proposedPrice: {
      type: String,
      trim: true
    },
    proposedTimeline: {
      type: String,
      trim: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  
  // Metrics
  viewsCount: {
    type: Number,
    default: 0
  },
  responsesCount: {
    type: Number,
    default: 0
  },
  
  // Timeline
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiry: 30 days from creation
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for days until expiry
proposalSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiresAt) return null;
  const now = new Date();
  const diffTime = this.expiresAt - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Indexes for better query performance
proposalSchema.index({ createdBy: 1 });
proposalSchema.index({ creatorType: 1 });
proposalSchema.index({ status: 1, priority: 1 });
proposalSchema.index({ category: 1, industry: 1 });
proposalSchema.index({ title: 'text', description: 'text' });
proposalSchema.index({ createdAt: -1 });
proposalSchema.index({ expiresAt: 1 });
proposalSchema.index({ tags: 1 });

/**
 * Add vendor response to proposal
 * @param {Object} responseData - Response data object
 */
proposalSchema.methods.addResponse = async function(responseData) {
  // Check if vendor already submitted a response
  const existingResponse = this.responses.find(
    r => r.vendorId.toString() === responseData.vendorId.toString()
  );
  
  if (existingResponse) {
    throw new Error('You have already submitted a response to this proposal');
  }
  
  this.responses.push(responseData);
  this.responsesCount = this.responses.length;
  this.status = this.status === 'draft' ? 'active' : this.status;
  await this.save();
  
  return this.responses[this.responses.length - 1];
};

/**
 * Update response status
 * @param {string} responseId - Response ID
 * @param {string} status - New status
 */
proposalSchema.methods.updateResponseStatus = async function(responseId, status) {
  const response = this.responses.id(responseId);
  if (!response) {
    throw new Error('Response not found');
  }
  
  response.status = status;
  if (status === 'accepted') {
    this.status = 'in_progress';
  }
  await this.save();
};

/**
 * Update response content
 * @param {string} responseId - Response ID
 * @param {Object} updateData - Data to update
 */
proposalSchema.methods.updateResponse = async function(responseId, updateData) {
  const response = this.responses.id(responseId);
  if (!response) {
    throw new Error('Response not found');
  }
  
  // Update fields
  if (updateData.solutionId !== undefined) {
    response.solutionId = updateData.solutionId;
  }
  if (updateData.proposalText !== undefined) {
    response.proposalText = updateData.proposalText;
  }
  if (updateData.proposedPrice !== undefined) {
    response.proposedPrice = updateData.proposedPrice;
  }
  if (updateData.proposedTimeline !== undefined) {
    response.proposedTimeline = updateData.proposedTimeline;
  }
  if (updateData.caseStudyLink !== undefined) {
    response.caseStudyLink = updateData.caseStudyLink;
  }
  if (updateData.attachments !== undefined) {
    response.attachments = updateData.attachments;
  }
  
  response.updatedAt = new Date();
  await this.save();
  
  return response;
};

/**
 * Increment views count
 */
proposalSchema.methods.incrementViews = async function() {
  this.viewsCount += 1;
  await this.save({ validateBeforeSave: false });
};

/**
 * Get public profile (without sensitive info)
 */
proposalSchema.methods.getPublicProfile = function() {
  const proposalObject = this.toObject();
  delete proposalObject.__v;
  return proposalObject;
};

/**
 * Check if proposal is expired
 */
proposalSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

module.exports = mongoose.model('Proposal', proposalSchema);
