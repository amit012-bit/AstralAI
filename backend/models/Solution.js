/**
 * Solution Model - AI solutions/products offered by vendors
 * Comprehensive solution profiles with features, pricing, and reviews
 */

const mongoose = require('mongoose');

// Solution schema definition
const solutionSchema = new mongoose.Schema({
  // Basic solution information
  title: {
    type: String,
    required: [true, 'Solution title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Solution description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  
  // Solution details
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  subcategory: {
    type: String,
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
  
  // Company and vendor information
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: false // Made optional to allow superadmins to create solutions without company
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Solution features and capabilities
  features: [{
    title: String,
    description: String,
    icon: String
  }],
  capabilities: [{
    type: String,
    trim: true
  }],
  technologies: [{
    type: String,
    trim: true
  }],
  
  // Pricing information
  pricing: {
    model: {
      type: String,
      enum: ['free', 'freemium', 'subscription', 'one-time', 'custom', 'contact'],
      required: true
    },
    price: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD',
        uppercase: true
      },
      period: {
        type: String,
        enum: ['monthly', 'yearly', 'one-time', 'per-user', 'per-feature']
      }
    },
    freeTrial: {
      available: {
        type: Boolean,
        default: false
      },
      duration: String
    },
    customPricing: {
      available: {
        type: Boolean,
        default: false
      },
      description: String
    }
  },
  
  // Media and documentation
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  videos: [{
    url: String,
    title: String,
    duration: String
  }],
  documents: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  
  // Solution status and verification
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'suspended'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Metrics and engagement
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  bookmarks: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },
  
  // Reviews and ratings
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Implementation details
  deployment: {
    type: {
      type: String,
      enum: ['cloud', 'on-premise', 'hybrid', 'saas', 'api'],
      required: true
    },
    setupTime: String,
    integrationComplexity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    supportLevel: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'enterprise'],
      default: 'standard'
    }
  },
  
  // Compliance and certifications
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    expiry: Date
  }],
  compliance: [{
    standard: String,
    status: String,
    description: String
  }],
  
  // Contact and demo information
  contactInfo: {
    email: String,
    phone: String,
    demoUrl: String,
    documentationUrl: String
  },
  
  // Customer-focused metrics (optional fields for backward compatibility)
  valuePropositions: [{
    type: String,
    trim: true,
    default: []
  }],
  performanceMetrics: [{
    metric: {
      type: String,
      trim: true
    },
    value: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  aiTechnology: {
    approach: {
      type: String,
      trim: true,
      default: ''
    },
    model: {
      type: String,
      trim: true,
      default: ''
    },
    accuracy: {
      type: String,
      trim: true,
      default: ''
    },
    processingTime: {
      type: String,
      trim: true,
      default: ''
    }
  },
  useCases: [{
    type: String,
    trim: true,
    default: []
  }],
  integrationHighlights: [{
    type: String,
    trim: true,
    default: []
  }],
  trustIndicators: [{
    type: String,
    trim: true,
    default: []
  }],
  quickBenefits: [{
    type: String,
    trim: true,
    default: []
  }],
  implementationTime: {
    type: String,
    trim: true,
    default: ''
  },
  
  // SEO and marketing
  metaTitle: String,
  metaDescription: String,
  keywords: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for primary image
solutionSchema.virtual('primaryImage').get(function() {
  const primaryImg = this.images.find(img => img.isPrimary);
  return primaryImg ? primaryImg.url : (this.images[0] ? this.images[0].url : '');
});

// Virtual field for price display
solutionSchema.virtual('priceDisplay').get(function() {
  const pricing = this.pricing;
  if (pricing.model === 'free') return 'Free';
  if (pricing.model === 'contact') return 'Contact for pricing';
  if (pricing.model === 'custom') return 'Custom pricing';
  
  if (pricing.price && pricing.price.amount) {
    const currency = pricing.price.currency || 'USD';
    const period = pricing.price.period ? `/${pricing.price.period}` : '';
    return `${currency} ${pricing.price.amount}${period}`;
  }
  
  return 'Pricing available';
});

// Indexes for better query performance
solutionSchema.index({ title: 'text', description: 'text', shortDescription: 'text' });
solutionSchema.index({ slug: 1 });
solutionSchema.index({ category: 1, industry: 1 });
solutionSchema.index({ companyId: 1 });
solutionSchema.index({ vendorId: 1 });
solutionSchema.index({ status: 1, isActive: 1 });
solutionSchema.index({ isFeatured: 1 });
solutionSchema.index({ 'rating.average': -1 });
solutionSchema.index({ tags: 1 });

/**
 * Generate slug from title before saving
 */
solutionSchema.pre('save', async function(next) {
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
  next();
});

/**
 * Update solution metrics
 * @param {string} solutionId - Solution ID
 * @param {string} metric - Metric to update (views, likes, bookmarks, inquiries)
 * @param {number} increment - Number to increment by
 */
solutionSchema.statics.updateMetric = async function(solutionId, metric, increment = 1) {
  const validMetrics = ['views', 'likes', 'bookmarks', 'inquiries'];
  if (!validMetrics.includes(metric)) {
    throw new Error('Invalid metric');
  }
  
  await this.findByIdAndUpdate(
    solutionId,
    { $inc: { [metric]: increment } },
    { new: true }
  );
};

/**
 * Update solution rating
 * @param {string} solutionId - Solution ID
 * @param {number} newRating - New rating value
 */
solutionSchema.statics.updateRating = async function(solutionId, newRating) {
  const solution = await this.findById(solutionId);
  if (!solution) return;

  const totalRating = solution.rating.average * solution.rating.count + newRating;
  solution.rating.count += 1;
  solution.rating.average = totalRating / solution.rating.count;
  
  await solution.save();
};

/**
 * Get solution profile for public display
 * @returns {Object} Clean solution profile
 */
solutionSchema.methods.getPublicProfile = function() {
  const solutionObject = this.toObject();
  delete solutionObject.__v;
  
  // Ensure customer-focused fields have default values for backward compatibility
  if (!solutionObject.valuePropositions) solutionObject.valuePropositions = [];
  if (!solutionObject.performanceMetrics) solutionObject.performanceMetrics = [];
  if (!solutionObject.aiTechnology) {
    solutionObject.aiTechnology = {
      approach: '',
      model: '',
      accuracy: '',
      processingTime: ''
    };
  }
  if (!solutionObject.useCases) solutionObject.useCases = [];
  if (!solutionObject.integrationHighlights) solutionObject.integrationHighlights = [];
  if (!solutionObject.trustIndicators) solutionObject.trustIndicators = [];
  if (!solutionObject.quickBenefits) solutionObject.quickBenefits = [];
  if (!solutionObject.implementationTime) solutionObject.implementationTime = '';
  
  return solutionObject;
};

module.exports = mongoose.model('Solution', solutionSchema);
