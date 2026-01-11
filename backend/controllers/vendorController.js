/**
 * Vendor Controller
 * Handles vendor profile operations
 */

const Vendor = require('../models/Vendor');
const User = require('../models/User');
const { AppError, catchAsync } = require('../middleware/errorHandler');

/**
 * Create or update vendor profile
 * @route POST /api/vendor
 * @access Private
 */
const createOrUpdateVendor = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  // Check if user has vendor role
  if (req.user.role !== 'vendor') {
    return next(new AppError('Only vendors can create vendor profiles', 403));
  }

  // Transform request body to match schema
  const vendorData = {
    userId,
    companyName: req.body.companyName,
    companyType: req.body.companyType,
    companyTypeOther: req.body.companyTypeOther,
    website: req.body.website,
    foundedYear: req.body.foundedYear,
    location: {
      state: req.body.state || req.body.location?.state,
      country: req.body.country || req.body.location?.country || 'United States',
      countryOther: req.body.countryOther || req.body.location?.countryOther,
    },
    companySize: req.body.companySize,
    primaryContact: {
      name: req.body.primaryContactName || req.body.primaryContact?.name,
      title: req.body.primaryContactTitle || req.body.primaryContact?.title,
      email: req.body.primaryContactEmail || req.body.primaryContact?.email,
      phone: req.body.primaryContactPhone || req.body.primaryContact?.phone,
    },
    secondaryContact: (req.body.secondaryContactName || req.body.secondaryContact?.name) ? {
      name: req.body.secondaryContactName || req.body.secondaryContact?.name,
      title: req.body.secondaryContactTitle || req.body.secondaryContact?.title,
      email: req.body.secondaryContactEmail || req.body.secondaryContact?.email,
      phone: req.body.secondaryContactPhone || req.body.secondaryContact?.phone,
    } : undefined,
    preferredContactMethod: req.body.preferredContactMethod || 'Email',
    bestTimeToContactDays: req.body.bestTimeToContactDays,
    bestTimeToContactStartTime: req.body.bestTimeToContactStartTime,
    bestTimeToContactEndTime: req.body.bestTimeToContactEndTime,
    bestTimeToContactTimeZone: req.body.bestTimeToContactTimeZone,
    bestTimeToContactTimeZoneOther: req.body.bestTimeToContactTimeZoneOther,
    solutionName: req.body.solutionName,
    solutionDescription: req.body.solutionDescription,
    solutionCategory: req.body.solutionCategory || [],
    targetSpecialties: req.body.targetSpecialties || [],
    targetInstitutionTypes: req.body.targetInstitutionTypes || [],
    keyFeatures: req.body.keyFeatures || [],
    keyFeaturesOther: req.body.keyFeaturesOther,
    technologyStack: req.body.technologyStack || [],
    technologyStackOther: req.body.technologyStackOther,
    deploymentOptions: req.body.deploymentOptions || [],
    integrationCapabilities: req.body.integrationCapabilities || [],
    integrationCapabilitiesOther: req.body.integrationCapabilitiesOther,
    complianceCertifications: req.body.complianceCertifications || [],
    complianceCertificationsOther: req.body.complianceCertificationsOther,
    securityFeatures: req.body.securityFeatures || [],
    securityFeaturesOther: req.body.securityFeaturesOther,
    dataHandling: req.body.dataHandling,
    pricingModel: req.body.pricingModel,
    pricingRange: req.body.pricingRange,
    contractTerms: req.body.contractTerms || [],
    implementationTime: req.body.implementationTime,
    supportOffered: req.body.supportOffered || [],
    supportOfferedOther: req.body.supportOfferedOther,
    trainingProvided: req.body.trainingProvided || [],
    trainingProvidedOther: req.body.trainingProvidedOther,
    currentClients: req.body.currentClients || [],
    clientCount: req.body.clientCount,
    caseStudies: req.body.caseStudies,
    testimonials: req.body.testimonials,
    awards: req.body.awards || [],
    competitiveAdvantages: req.body.competitiveAdvantages || [],
    competitiveAdvantagesOther: req.body.competitiveAdvantagesOther,
    futureRoadmap: req.body.futureRoadmap,
    additionalNotes: req.body.additionalNotes,
    status: 'submitted',
    submittedAt: new Date(),
  };

  // Remove undefined fields
  Object.keys(vendorData).forEach(key => {
    if (vendorData[key] === undefined) {
      delete vendorData[key];
    }
  });

  // Find existing or create new
  let vendor = await Vendor.findOne({ userId });
  
  if (vendor) {
    // Update existing
    Object.assign(vendor, vendorData);
    await vendor.save();
  } else {
    // Create new
    vendor = await Vendor.create(vendorData);
  }

  // Update user profile flags
  const user = await User.findById(userId);
  if (user) {
    user.hasVendorProfile = true;
    if (!user.profileCompletedAt) {
      user.profileCompletedAt = new Date();
    }
    await user.save();
  }

  res.status(200).json({
    success: true,
    data: vendor,
    message: 'Vendor profile saved successfully'
  });
});

/**
 * Get vendor profile for current user
 * @route GET /api/vendor
 * @access Private
 */
const getVendor = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const vendor = await Vendor.findOne({ userId });

  if (!vendor) {
    return res.status(200).json({
      success: false,
      data: null,
      message: 'Vendor profile not found'
    });
  }

  res.status(200).json({
    success: true,
    data: vendor
  });
});

/**
 * Get vendor profile by user ID
 * @route GET /api/vendor/:userId
 * @access Private
 */
const getVendorByUserId = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // Check if requesting user's own profile or admin
  if (userId !== req.user._id.toString() && req.user.role !== 'superadmin') {
    return next(new AppError('Not authorized to access this profile', 403));
  }

  const vendor = await Vendor.findOne({ userId });

  if (!vendor) {
    return res.status(200).json({
      success: false,
      data: null,
      message: 'Vendor profile not found'
    });
  }

  res.status(200).json({
    success: true,
    data: vendor
  });
});

module.exports = {
  createOrUpdateVendor,
  getVendor,
  getVendorByUserId
};
