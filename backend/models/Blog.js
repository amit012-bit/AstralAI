/**
 * Blog Model - Latest blogs and articles
 * Handles blog content, categories, and engagement metrics
 */

const mongoose = require('mongoose');

// Blog schema definition
const blogSchema = new mongoose.Schema({
  // Basic blog information
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: [true, 'Blog excerpt is required'],
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  content: {
    type: String,
    required: [true, 'Blog content is required']
  },
  
  // Author information
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorBio: String,
  authorAvatar: String,
  
  // Blog categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  subcategory: {
    type: String,
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
  
  // Media and visuals
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  images: [{
    url: String,
    alt: String,
    caption: String
  }],
  
  // Blog status and publication
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isSponsored: {
    type: Boolean,
    default: false
  },
  
  // Publication details
  publishedAt: Date,
  scheduledAt: Date,
  
  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number, // in minutes
    default: 5
  },
  
  // SEO and metadata
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  
  // Related content
  relatedSolutions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Solution'
  }],
  relatedBlogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }],
  
  // Comments and interactions
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    userAvatar: String,
    content: String,
    isApproved: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    replies: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      userName: String,
      content: String,
      isApproved: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for URL
blogSchema.virtual('url').get(function() {
  return `/blog/${this.slug}`;
});

// Virtual field for formatted published date
blogSchema.virtual('formattedDate').get(function() {
  if (!this.publishedAt) return null;
  return this.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Indexes for better query performance
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });
blogSchema.index({ slug: 1 });
blogSchema.index({ authorId: 1 });
blogSchema.index({ category: 1, industry: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ isFeatured: 1 });
blogSchema.index({ tags: 1 });

/**
 * Generate slug from title before saving
 */
blogSchema.pre('save', async function(next) {
  if (this.isModified('title') && !this.slug) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (await this.constructor.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  
  // Calculate read time based on content length
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  
  next();
});

/**
 * Publish blog post
 */
blogSchema.methods.publish = function() {
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

/**
 * Add comment to blog
 * @param {Object} commentData - Comment data
 * @returns {Promise<Object>} Added comment
 */
blogSchema.methods.addComment = async function(commentData) {
  const comment = {
    ...commentData,
    createdAt: new Date()
  };
  
  this.comments.push(comment);
  await this.save();
  return comment;
};

/**
 * Update engagement metrics
 * @param {string} metric - Metric to update (views, likes, shares, comments)
 * @param {number} increment - Number to increment by
 */
blogSchema.methods.updateMetric = async function(metric, increment = 1) {
  const validMetrics = ['views', 'likes', 'shares', 'comments'];
  if (!validMetrics.includes(metric)) {
    throw new Error('Invalid metric');
  }
  
  this[metric] += increment;
  await this.save();
};

/**
 * Get blog profile for public display
 * @returns {Object} Clean blog profile
 */
blogSchema.methods.getPublicProfile = function() {
  const blogObject = this.toObject();
  delete blogObject.__v;
  return blogObject;
};

/**
 * Static method to find published blogs by category
 * @param {string} category - Category to filter by
 * @param {number} limit - Number of blogs to return
 * @returns {Promise<Array>} Array of published blogs
 */
blogSchema.statics.findPublishedByCategory = function(category, limit = 10) {
  return this.find({
    status: 'published',
    ...(category && { category })
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .select('title slug excerpt featuredImage publishedAt readTime authorName');
};

/**
 * Static method to find featured blogs
 * @param {number} limit - Number of blogs to return
 * @returns {Promise<Array>} Array of featured blogs
 */
blogSchema.statics.findFeatured = function(limit = 5) {
  return this.find({
    status: 'published',
    isFeatured: true
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .select('title slug excerpt featuredImage publishedAt readTime authorName');
};

module.exports = mongoose.model('Blog', blogSchema);
