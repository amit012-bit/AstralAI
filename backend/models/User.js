/**
 * User Model - Handles vendors, customers, and superadmin users
 * Supports role-based access control with comprehensive user profiles
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema definition with validation
const userSchema = new mongoose.Schema({
  // Basic user information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  
  // User role and permissions
  role: {
    type: String,
    enum: ['customer', 'vendor', 'superadmin'],
    default: 'customer',
    required: true
  },
  
  // Profile information
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  
  // Vendor-specific fields
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: function() { return this.role === 'vendor'; }
  },
  
  // Customer-specific fields
  interests: [{
    type: String,
    trim: true
  }],
  industry: {
    type: String,
    trim: true
  },
  
  // Profile completion flags (for solutions-hub-main compatibility)
  hasInstitutionProfile: {
    type: Boolean,
    default: false
  },
  hasVendorProfile: {
    type: Boolean,
    default: false
  },
  profileCompletedAt: {
    type: Date
  },
  
  // Account status and verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Social login fields
  googleId: String,
  linkedinId: String,
  
  // Timestamps
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ companyId: 1 });

/**
 * Hash password before saving to database
 */
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with salt rounds of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare provided password with hashed password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} True if passwords match
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Update last login timestamp
 */
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

/**
 * Get user profile without sensitive information
 * @returns {Object} Clean user profile
 */
userSchema.methods.getProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

/**
 * Get public user profile for admin views
 * @returns {Object} Public user profile
 */
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpire;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpire;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
