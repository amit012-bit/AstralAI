/**
 * Query Model - Customer queries and search requests
 * Handles customer inquiries and AI-powered solution matching
 */

const mongoose = require('mongoose');

// Query schema definition
const querySchema = new mongoose.Schema({
  // Query information
  title: {
    type: String,
    required: [true, 'Query title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Query description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Customer information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Query categorization
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
  
  // Query requirements
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
    companySize: {
      type: String,
      enum: ['startup', 'small', 'medium', 'enterprise', 'any'],
      default: 'any'
    },
    deployment: {
      type: String,
      enum: ['cloud', 'on-premise', 'hybrid', 'any'],
      default: 'any'
    }
  },
  
  // Query status and processing
  status: {
    type: String,
    enum: ['active', 'processing', 'matched', 'closed', 'expired'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Matching results
  matchedSolutions: [{
    solutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Solution'
    },
    relevanceScore: {
      type: Number,
      min: 0,
      max: 100
    },
    matchedAt: {
      type: Date,
      default: Date.now
    },
    customerViewed: {
      type: Boolean,
      default: false
    },
    customerContacted: {
      type: Boolean,
      default: false
    }
  }],
  
  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },
  vendorResponses: {
    type: Number,
    default: 0
  },
  customerInquiries: {
    type: Number,
    default: 0
  },
  
  // Query timeline
  postedAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiry: 30 days from posting
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  
  // Additional query details
  contactPreference: {
    type: String,
    enum: ['email', 'phone', 'meeting', 'any'],
    default: 'email'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Query resolution
  resolution: {
    selectedSolution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Solution'
    },
    resolutionNotes: String,
    resolvedAt: Date,
    satisfaction: {
      type: Number,
      min: 1,
      max: 5
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for days until expiry
querySchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiresAt) return null;
  const now = new Date();
  const diffTime = this.expiresAt - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual field for budget display
querySchema.virtual('budgetDisplay').get(function() {
  const budget = this.requirements.budget;
  if (!budget || (!budget.min && !budget.max)) return 'Budget not specified';
  
  const currency = budget.currency || 'USD';
  
  if (budget.min && budget.max) {
    return `${currency} ${budget.min} - ${budget.max}`;
  } else if (budget.min) {
    return `${currency} ${budget.min}+`;
  } else if (budget.max) {
    return `Up to ${currency} ${budget.max}`;
  }
  
  return 'Budget not specified';
});

// Indexes for better query performance
querySchema.index({ title: 'text', description: 'text' });
querySchema.index({ customerId: 1 });
querySchema.index({ category: 1, industry: 1 });
querySchema.index({ status: 1, priority: 1 });
querySchema.index({ postedAt: -1 });
querySchema.index({ expiresAt: 1 });
querySchema.index({ tags: 1 });

/**
 * Update last activity timestamp
 */
querySchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save({ validateBeforeSave: false });
};

/**
 * Add matched solution to query
 * @param {string} solutionId - Solution ID to match
 * @param {number} relevanceScore - Relevance score (0-100)
 */
querySchema.methods.addMatchedSolution = async function(solutionId, relevanceScore) {
  // Check if solution is already matched
  const existingMatch = this.matchedSolutions.find(
    match => match.solutionId.toString() === solutionId
  );
  
  if (existingMatch) {
    existingMatch.relevanceScore = relevanceScore;
    existingMatch.matchedAt = new Date();
  } else {
    this.matchedSolutions.push({
      solutionId,
      relevanceScore,
      matchedAt: new Date()
    });
  }
  
  this.status = 'matched';
  await this.save();
};

/**
 * Mark solution as viewed by customer
 * @param {string} solutionId - Solution ID
 */
querySchema.methods.markSolutionViewed = async function(solutionId) {
  const match = this.matchedSolutions.find(
    m => m.solutionId.toString() === solutionId
  );
  
  if (match) {
    match.customerViewed = true;
    await this.save();
  }
};

/**
 * Check if query is expired
 * @returns {boolean} True if query is expired
 */
querySchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

/**
 * Get query profile for public display
 * @returns {Object} Clean query profile
 */
querySchema.methods.getPublicProfile = function() {
  const queryObject = this.toObject();
  delete queryObject.__v;
  return queryObject;
};

/**
 * Static method to find active queries by category and industry
 * @param {string} category - Category to filter by
 * @param {string} industry - Industry to filter by
 * @returns {Promise<Array>} Array of active queries
 */
querySchema.statics.findActiveQueries = function(category, industry) {
  return this.find({
    status: 'active',
    isPublic: true,
    expiresAt: { $gt: new Date() },
    ...(category && { category }),
    ...(industry && { industry })
  })
  .populate('customerId', 'firstName lastName companyId')
  .sort({ postedAt: -1 });
};

module.exports = mongoose.model('Query', querySchema);
