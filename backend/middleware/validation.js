/**
 * Validation Middleware
 * Handles request validation using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

/**
 * User registration validation
 */
const validateUserRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
    
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
    
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('role')
    .optional()
    .isIn(['customer', 'vendor'])
    .withMessage('Role must be either customer or vendor'),
    
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
    
  handleValidationErrors
];

/**
 * User login validation
 */
const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  handleValidationErrors
];

/**
 * Company creation validation
 */
const validateCompanyCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
    
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Company description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
    
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
    
  body('email')
    .isEmail()
    .withMessage('Please provide a valid company email')
    .normalizeEmail(),
    
  body('industry')
    .trim()
    .notEmpty()
    .withMessage('Industry is required'),
    
  body('companySize')
    .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
    .withMessage('Invalid company size'),
    
  body('categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
    
  handleValidationErrors
];

/**
 * Solution creation validation
 */
const validateSolutionCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Solution title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
    
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Solution description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
    
  body('shortDescription')
    .trim()
    .notEmpty()
    .withMessage('Short description is required')
    .isLength({ max: 200 })
    .withMessage('Short description cannot exceed 200 characters'),
    
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
    
  body('industry')
    .trim()
    .notEmpty()
    .withMessage('Industry is required'),
    
  body('pricing.model')
    .isIn(['free', 'freemium', 'subscription', 'one-time', 'custom', 'contact'])
    .withMessage('Invalid pricing model'),
    
  body('deployment.type')
    .isIn(['cloud', 'on-premise', 'hybrid', 'saas', 'api'])
    .withMessage('Invalid deployment type'),
    
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
    
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
    
  handleValidationErrors
];

/**
 * Query creation validation
 */
const validateQueryCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Query title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
    
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Query description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
    
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
    
  body('industry')
    .trim()
    .notEmpty()
    .withMessage('Industry is required'),
    
  body('requirements.budget.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum budget must be a number'),
    
  body('requirements.budget.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum budget must be a number'),
    
  body('requirements.timeline')
    .optional()
    .isIn(['immediate', '1-month', '3-months', '6-months', '1-year', 'flexible'])
    .withMessage('Invalid timeline'),
    
  handleValidationErrors
];

/**
 * Blog creation validation
 */
const validateBlogCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Blog title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
    
  body('excerpt')
    .trim()
    .notEmpty()
    .withMessage('Blog excerpt is required')
    .isLength({ max: 300 })
    .withMessage('Excerpt cannot exceed 300 characters'),
    
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Blog content is required'),
    
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
    
  body('industry')
    .trim()
    .notEmpty()
    .withMessage('Industry is required'),
    
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
    
  handleValidationErrors
];

/**
 * Review creation validation
 */
const validateReviewCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Review title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
    
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Review content is required')
    .isLength({ max: 1000 })
    .withMessage('Review cannot exceed 1000 characters'),
    
  body('rating.overall')
    .isInt({ min: 1, max: 5 })
    .withMessage('Overall rating must be between 1 and 5'),
    
  body('rating.features')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Features rating must be between 1 and 5'),
    
  body('rating.easeOfUse')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Ease of use rating must be between 1 and 5'),
    
  body('rating.valueForMoney')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Value for money rating must be between 1 and 5'),
    
  body('rating.customerSupport')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Customer support rating must be between 1 and 5'),
    
  body('implementation.duration')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Implementation duration is required'),
    
  handleValidationErrors
];

/**
 * MongoDB ObjectId validation
 */
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
    
  handleValidationErrors
];

/**
 * Pagination validation
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'rating', 'views', 'title'])
    .withMessage('Invalid sort option'),
    
  handleValidationErrors
];

/**
 * Admin drafts validation
 */
const validateAdminDrafts = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('status')
    .optional()
    .isIn(['draft', 'pending', 'approved', 'rejected'])
    .withMessage('Status must be one of: draft, pending, approved, rejected'),
    
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string'),
    
  handleValidationErrors
];

/**
 * Search validation
 */
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
    
  query('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
    
  query('industry')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Industry cannot be empty'),
    
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateCompanyCreation,
  validateSolutionCreation,
  validateQueryCreation,
  validateBlogCreation,
  validateReviewCreation,
  validateObjectId,
  validatePagination,
  validateAdminDrafts,
  validateSearch
};
