/**
 * Company Model - Stores vendor company information
 * Handles company profiles, verification status, and business details
 */

const mongoose = require('mongoose');

// Company schema definition
const companySchema = new mongoose.Schema({
  // Basic company information
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Company description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Company details
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  logo: {
    type: String,
    default: ''
  },
  foundedYear: {
    type: Number,
    min: [1800, 'Founded year must be after 1800'],
    max: [new Date().getFullYear(), 'Founded year cannot be in the future']
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    required: true
  },
  
  // Contact information
  email: {
    type: String,
    required: [true, 'Company email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // Business information
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true
  },
  categories: [{
    type: String,
    trim: true
  }],
  
  // Company status and verification
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationDate: Date,
  verificationDocuments: [String],
  
  // Social media links
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String,
    youtube: String
  },
  
  // Company metrics
  totalSolutions: {
    type: Number,
    default: 0
  },
  totalCustomers: {
    type: Number,
    default: 0
  },
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
  
  // Featured content
  featuredSolutions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Solution'
  }],
  
  // Company highlights and achievements
  highlights: [{
    title: String,
    description: String,
    year: Number
  }],
  
  // Team information
  teamSize: Number,
  keyTeamMembers: [{
    name: String,
    position: String,
    linkedin: String,
    image: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for full address
companySchema.virtual('fullAddress').get(function() {
  const address = this.address;
  if (!address) return '';
  
  const parts = [
    address.street,
    address.city,
    address.state,
    address.country,
    address.zipCode
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Virtual field for company age
companySchema.virtual('age').get(function() {
  if (!this.foundedYear) return null;
  return new Date().getFullYear() - this.foundedYear;
});

// Indexes for better query performance
companySchema.index({ name: 'text', description: 'text' });
companySchema.index({ slug: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ categories: 1 });
companySchema.index({ isVerified: 1, isActive: 1 });

/**
 * Generate slug from company name before saving
 */
companySchema.pre('save', async function(next) {
  if (this.isModified('name') && !this.slug) {
    let baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-'); // Remove leading/trailing hyphens
    
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
 * Update company metrics when solutions are added/removed
 * @param {string} companyId - Company ID
 * @param {number} increment - Number to increment by (can be negative)
 */
companySchema.statics.updateSolutionCount = async function(companyId, increment = 1) {
  await this.findByIdAndUpdate(
    companyId,
    { $inc: { totalSolutions: increment } },
    { new: true }
  );
};

/**
 * Update company rating
 * @param {string} companyId - Company ID
 * @param {number} newRating - New rating value
 */
companySchema.statics.updateRating = async function(companyId, newRating) {
  const company = await this.findById(companyId);
  if (!company) return;

  const totalRating = company.rating.average * company.rating.count + newRating;
  company.rating.count += 1;
  company.rating.average = totalRating / company.rating.count;
  
  await company.save();
};

/**
 * Get company profile for public display
 * @returns {Object} Clean company profile
 */
companySchema.methods.getPublicProfile = function() {
  const companyObject = this.toObject();
  delete companyObject.verificationDocuments;
  delete companyObject.__v;
  return companyObject;
};

module.exports = mongoose.model('Company', companySchema);
