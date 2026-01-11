/**
 * Authentication Controller
 * Handles user registration, login, and authentication-related operations
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const { AppError, catchAsync } = require('../middleware/errorHandler');

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * Send token response
 * @param {Object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 */
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id);
  
  // Update last login
  user.updateLastLogin();

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: user.getProfile()
  });
};

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, role, phone, industry, interests } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Create new user
  const userData = {
    firstName,
    lastName,
    email,
    password,
    role: role || 'customer',
    phone,
    industry,
    interests
  };

  const user = await User.create(userData);

  // If user is a vendor, create company (optional during registration)
  if (role === 'vendor' && req.body.company) {
    const company = await Company.create({
      ...req.body.company,
      email: email, // Use user's email as company email initially
      companySize: req.body.company.companySize || '1-10'
    });

    // Update user with company ID
    user.companyId = company._id;
    await user.save();
  }

  sendTokenResponse(user, 201, res, 'User registered successfully');
});

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Account is deactivated. Please contact support.', 401));
  }

  // Check password
  const isPasswordCorrect = await user.comparePassword(password);
  
  if (!isPasswordCorrect) {
    return next(new AppError('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res, 'Login successful');
});

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .populate('companyId', 'name logo industry')
    .select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user: user.getProfile()
  });
});

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const updateProfile = catchAsync(async (req, res, next) => {
  const allowedUpdates = [
    'firstName', 'lastName', 'phone', 'bio', 'location', 
    'industry', 'interests', 'avatar'
  ];
  
  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: user.getProfile()
  });
});

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
  
  if (!isCurrentPasswordCorrect) {
    return next(new AppError('Current password is incorrect', 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Forgot password (send reset email)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  
  if (!user) {
    return next(new AppError('No user found with this email address', 404));
  }

  // Generate reset token (in a real app, you'd send this via email)
  const resetToken = generateToken(user._id);
  
  // In production, you would:
  // 1. Save reset token to database with expiry
  // 2. Send email with reset link
  // 3. Return success message without exposing token

  res.status(200).json({
    success: true,
    message: 'Password reset token sent to email',
    resetToken // Remove this in production
  });
});

/**
 * Reset password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const resetPassword = catchAsync(async (req, res, next) => {
  const { token, newPassword } = req.body;

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  const user = await User.findById(decoded.userId);
  
  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully'
  });
});

/**
 * Logout user (client-side token removal)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const logout = catchAsync(async (req, res, next) => {
  // In a more sophisticated setup, you might:
  // 1. Add token to blacklist
  // 2. Update user's last logout time
  // 3. Clear server-side sessions

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * Delete user account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const deleteAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  // Verify password before deletion
  const user = await User.findById(req.user._id).select('+password');
  
  const isPasswordCorrect = await user.comparePassword(password);
  
  if (!isPasswordCorrect) {
    return next(new AppError('Password is incorrect', 400));
  }

  // Soft delete - deactivate account instead of removing
  user.isActive = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully'
  });
});

/**
 * Verify email address
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  // In a real app, you'd verify the email token
  // For now, we'll just mark email as verified
  const user = await User.findById(req.user._id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.isEmailVerified = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

/**
 * Get all users (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getAllUsers = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    role,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};
  
  if (role) {
    filter.role = role;
  }
  
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const users = await User.find(filter)
    .populate('companyId', 'name logo industry isVerified')
    .select('-password -__v')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(filter);

  // Get user statistics
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  const roleStats = stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    users: users.map(user => user.getPublicProfile()),
    stats: {
      total: total,
      roles: roleStats
    }
  });
});

/**
 * Get or update user data (for solutions-hub-main compatibility)
 * Maps buyer->customer, seller->vendor
 * @route GET/POST /api/user
 * @access Private
 */
const getUserData = catchAsync(async (req, res, next) => {
  const HealthcareInstitution = require('../models/HealthcareInstitution');
  const Vendor = require('../models/Vendor');
  
  const user = await User.findById(req.user._id).select('-password');
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if user has profiles
  const hasInstitution = await HealthcareInstitution.findOne({ userId: user._id });
  const hasVendor = await Vendor.findOne({ userId: user._id });
  
  // Update profile flags
  user.hasInstitutionProfile = !!hasInstitution;
  user.hasVendorProfile = !!hasVendor;
  if ((hasInstitution || hasVendor) && !user.profileCompletedAt) {
    user.profileCompletedAt = new Date();
  }
  await user.save();

  // Map role for frontend compatibility (customer->buyer, vendor->seller)
  const userData = user.getProfile();
  const roleMap = { customer: 'buyer', vendor: 'seller', superadmin: 'superadmin' };
  userData.role = roleMap[userData.role] || userData.role;

  res.status(200).json({
    success: true,
    data: userData
  });
});

const updateUserRole = catchAsync(async (req, res, next) => {
  const HealthcareInstitution = require('../models/HealthcareInstitution');
  const Vendor = require('../models/Vendor');
  
  const { role } = req.body;
  
  // Map buyer->customer, seller->vendor
  const roleMap = { buyer: 'customer', seller: 'vendor' };
  const backendRole = roleMap[role] || role;
  
  if (!['customer', 'vendor'].includes(backendRole)) {
    return next(new AppError('Invalid role. Must be buyer or seller', 400));
  }

  const user = await User.findById(req.user._id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.role = backendRole;
  await user.save();

  // Check profile flags
  const hasInstitution = await HealthcareInstitution.findOne({ userId: user._id });
  const hasVendor = await Vendor.findOne({ userId: user._id });
  user.hasInstitutionProfile = !!hasInstitution;
  user.hasVendorProfile = !!hasVendor;
  await user.save();

  const userData = user.getProfile();
  const frontendRoleMap = { customer: 'buyer', vendor: 'seller', superadmin: 'superadmin' };
  userData.role = frontendRoleMap[userData.role] || userData.role;

  res.status(200).json({
    success: true,
    data: userData
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
  deleteAccount,
  verifyEmail,
  getAllUsers,
  getUserData,
  updateUserRole
};
