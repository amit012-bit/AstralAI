/**
 * Newsletter Model - Newsletter content and subscriptions
 * Handles newsletter creation, distribution, and subscriber management
 */

const mongoose = require('mongoose');

// Newsletter schema definition
const newsletterSchema = new mongoose.Schema({
  // Basic newsletter information
  title: {
    type: String,
    required: [true, 'Newsletter title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Newsletter description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Newsletter content
  content: {
    type: String,
    required: [true, 'Newsletter content is required']
  },
  htmlContent: String, // For rich HTML content
  
  // Author and editor information
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  editorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Newsletter categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true
  },
  
  // Newsletter status and publication
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'sent', 'archived'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Publication details
  publishedAt: Date,
  scheduledAt: Date,
  sentAt: Date,
  
  // Distribution settings
  distribution: {
    targetAudience: {
      type: String,
      enum: ['all', 'customers', 'vendors', 'specific-industry', 'custom'],
      default: 'all'
    },
    industryFilter: [String],
    roleFilter: [String],
    customFilters: mongoose.Schema.Types.Mixed
  },
  
  // Newsletter metrics
  metrics: {
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    opened: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    },
    unsubscribed: {
      type: Number,
      default: 0
    },
    bounced: {
      type: Number,
      default: 0
    }
  },
  
  // Featured content
  featuredSolutions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Solution'
  }],
  featuredBlogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }],
  featuredCompanies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }],
  
  // Newsletter template and design
  template: {
    name: String,
    colors: {
      primary: String,
      secondary: String,
      background: String,
      text: String
    },
    layout: String,
    headerImage: String,
    footerContent: String
  },
  
  // SEO and metadata
  metaTitle: String,
  metaDescription: String,
  
  // Archive and versioning
  isArchived: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    content: String,
    updatedAt: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for open rate
newsletterSchema.virtual('openRate').get(function() {
  if (this.metrics.delivered === 0) return 0;
  return Math.round((this.metrics.opened / this.metrics.delivered) * 100);
});

// Virtual field for click rate
newsletterSchema.virtual('clickRate').get(function() {
  if (this.metrics.delivered === 0) return 0;
  return Math.round((this.metrics.clicked / this.metrics.delivered) * 100);
});

// Virtual field for URL
newsletterSchema.virtual('url').get(function() {
  return `/newsletter/${this.slug}`;
});

// Indexes for better query performance
newsletterSchema.index({ title: 'text', description: 'text', content: 'text' });
newsletterSchema.index({ slug: 1 });
newsletterSchema.index({ authorId: 1 });
newsletterSchema.index({ category: 1, industry: 1 });
newsletterSchema.index({ status: 1, publishedAt: -1 });
newsletterSchema.index({ scheduledAt: 1 });

/**
 * Generate slug from title before saving
 */
newsletterSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

/**
 * Schedule newsletter for future publication
 * @param {Date} scheduleDate - Date to schedule publication
 */
newsletterSchema.methods.schedule = function(scheduleDate) {
  this.status = 'scheduled';
  this.scheduledAt = scheduleDate;
  return this.save();
};

/**
 * Publish newsletter
 */
newsletterSchema.methods.publish = function() {
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

/**
 * Mark newsletter as sent
 * @param {number} sentCount - Number of emails sent
 */
newsletterSchema.methods.markAsSent = function(sentCount) {
  this.status = 'sent';
  this.sentAt = new Date();
  this.metrics.sent = sentCount;
  return this.save();
};

/**
 * Update newsletter metrics
 * @param {Object} metricUpdates - Metrics to update
 */
newsletterSchema.methods.updateMetrics = async function(metricUpdates) {
  Object.keys(metricUpdates).forEach(key => {
    if (this.metrics[key] !== undefined) {
      this.metrics[key] += metricUpdates[key];
    }
  });
  await this.save();
};

/**
 * Create new version of newsletter
 * @param {string} newContent - New content for the newsletter
 * @param {string} userId - ID of user making the update
 */
newsletterSchema.methods.createNewVersion = async function(newContent, userId) {
  // Save current version to history
  this.previousVersions.push({
    version: this.version,
    content: this.content,
    updatedAt: new Date(),
    updatedBy: userId
  });
  
  // Update current version
  this.version += 1;
  this.content = newContent;
  
  await this.save();
};

/**
 * Get newsletter profile for public display
 * @returns {Object} Clean newsletter profile
 */
newsletterSchema.methods.getPublicProfile = function() {
  const newsletterObject = this.toObject();
  delete newsletterObject.__v;
  return newsletterObject;
};

/**
 * Static method to find published newsletters by category
 * @param {string} category - Category to filter by
 * @param {number} limit - Number of newsletters to return
 * @returns {Promise<Array>} Array of published newsletters
 */
newsletterSchema.statics.findPublishedByCategory = function(category, limit = 10) {
  return this.find({
    status: { $in: ['published', 'sent'] },
    ...(category && { category })
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .select('title slug description publishedAt category industry');
};

/**
 * Static method to find scheduled newsletters
 * @returns {Promise<Array>} Array of scheduled newsletters
 */
newsletterSchema.statics.findScheduled = function() {
  return this.find({
    status: 'scheduled',
    scheduledAt: { $lte: new Date() }
  })
  .sort({ scheduledAt: 1 });
};

module.exports = mongoose.model('Newsletter', newsletterSchema);
