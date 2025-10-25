/**
 * Review Model - Customer reviews for solutions
 * Handles solution reviews, ratings, and feedback
 */

const mongoose = require('mongoose');

// Review schema definition
const reviewSchema = new mongoose.Schema({
  // Review content
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Review content is required'],
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  
  // Rating information
  rating: {
    overall: {
      type: Number,
      required: [true, 'Overall rating is required'],
      min: 1,
      max: 5
    },
    features: {
      type: Number,
      min: 1,
      max: 5
    },
    easeOfUse: {
      type: Number,
      min: 1,
      max: 5
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5
    },
    customerSupport: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Solution and customer information
  solutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Solution',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Customer details (cached for performance)
  customerName: {
    type: String,
    required: true
  },
  customerCompany: String,
  customerRole: String,
  
  // Review status and verification
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  // Review metadata
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  reported: {
    count: {
      type: Number,
      default: 0
    },
    reasons: [String],
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Implementation details
  implementation: {
    duration: String, // How long they've been using the solution
    companySize: String,
    useCase: String,
    challenges: [String],
    benefits: [String]
  },
  
  // Review timeline
  reviewedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for average detailed rating
reviewSchema.virtual('averageDetailedRating').get(function() {
  const ratings = [
    this.rating.features,
    this.rating.easeOfUse,
    this.rating.valueForMoney,
    this.rating.customerSupport
  ].filter(rating => rating !== undefined);
  
  if (ratings.length === 0) return this.rating.overall;
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
});

// Virtual field for formatted date
reviewSchema.virtual('formattedDate').get(function() {
  return this.reviewedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Indexes for better query performance
reviewSchema.index({ solutionId: 1, status: 1 });
reviewSchema.index({ companyId: 1 });
reviewSchema.index({ customerId: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ reviewedAt: -1 });
reviewSchema.index({ status: 1 });

/**
 * Approve review
 */
reviewSchema.methods.approve = function() {
  this.status = 'approved';
  this.approvedAt = new Date();
  return this.save();
};

/**
 * Reject review
 */
reviewSchema.methods.reject = function() {
  this.status = 'rejected';
  return this.save();
};

/**
 * Flag review for moderation
 * @param {string} reason - Reason for flagging
 * @param {string} userId - ID of user flagging the review
 */
reviewSchema.methods.flag = function(reason, userId) {
  this.status = 'flagged';
  this.reported.count += 1;
  this.reported.reasons.push(reason);
  this.reported.users.push(userId);
  return this.save();
};

/**
 * Mark review as helpful
 * @param {string} userId - ID of user marking as helpful
 */
reviewSchema.methods.markHelpful = function(userId) {
  // Check if user already marked as helpful
  const alreadyMarked = this.helpful.users.includes(userId);
  
  if (!alreadyMarked) {
    this.helpful.count += 1;
    this.helpful.users.push(userId);
  }
  
  return this.save();
};

/**
 * Remove helpful mark
 * @param {string} userId - ID of user removing helpful mark
 */
reviewSchema.methods.removeHelpful = function(userId) {
  const userIndex = this.helpful.users.indexOf(userId);
  
  if (userIndex > -1) {
    this.helpful.count -= 1;
    this.helpful.users.splice(userIndex, 1);
  }
  
  return this.save();
};

/**
 * Update review content
 * @param {Object} updateData - Data to update
 */
reviewSchema.methods.updateContent = async function(updateData) {
  Object.keys(updateData).forEach(key => {
    if (this[key] !== undefined) {
      this[key] = updateData[key];
    }
  });
  
  this.lastUpdated = new Date();
  await this.save();
};

/**
 * Get review profile for public display
 * @returns {Object} Clean review profile
 */
reviewSchema.methods.getPublicProfile = function() {
  const reviewObject = this.toObject();
  
  // Hide customer information if anonymous
  if (this.isAnonymous) {
    reviewObject.customerName = 'Anonymous';
    reviewObject.customerCompany = '';
    reviewObject.customerRole = '';
  }
  
  delete reviewObject.__v;
  return reviewObject;
};

/**
 * Static method to find approved reviews for a solution
 * @param {string} solutionId - Solution ID
 * @param {number} limit - Number of reviews to return
 * @returns {Promise<Array>} Array of approved reviews
 */
reviewSchema.statics.findApprovedBySolution = function(solutionId, limit = 10) {
  return this.find({
    solutionId,
    status: 'approved'
  })
  .sort({ reviewedAt: -1 })
  .limit(limit)
  .populate('customerId', 'firstName lastName avatar')
  .select('-reported -__v');
};

/**
 * Static method to calculate average rating for a solution
 * @param {string} solutionId - Solution ID
 * @returns {Promise<Object>} Rating statistics
 */
reviewSchema.statics.calculateAverageRating = async function(solutionId) {
  const result = await this.aggregate([
    {
      $match: {
        solutionId: mongoose.Types.ObjectId(solutionId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating.overall' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating.overall'
        }
      }
    }
  ]);
  
  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
  
  const data = result[0];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  data.ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });
  
  return {
    averageRating: Math.round(data.averageRating * 10) / 10,
    totalReviews: data.totalReviews,
    ratingDistribution: distribution
  };
};

module.exports = mongoose.model('Review', reviewSchema);
