/**
 * Institution Controller
 * Handles healthcare institution profile operations
 */

const HealthcareInstitution = require('../models/HealthcareInstitution');
const User = require('../models/User');
const { AppError, catchAsync } = require('../middleware/errorHandler');

/**
 * Create or update institution profile
 * @route POST /api/institution
 * @access Private
 */
const createOrUpdateInstitution = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  // Check if user has customer role
  if (req.user.role !== 'customer') {
    return next(new AppError('Only customers can create institution profiles', 403));
  }

  // Transform request body to match schema
  const institutionData = {
    userId,
    selectedAISolutions: req.body.selectedAISolutions || [],
    institutionName: req.body.institutionName,
    institutionType: req.body.institutionType,
    location: {
      state: req.body.state || req.body.location?.state,
      country: req.body.country || req.body.location?.country || 'United States',
    },
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
    bestTimeToContact: req.body.bestTimeToContact,
    bestTimeToContactDays: req.body.bestTimeToContactDays,
    bestTimeToContactStartTime: req.body.bestTimeToContactStartTime,
    bestTimeToContactEndTime: req.body.bestTimeToContactEndTime,
    bestTimeToContactTimeZone: req.body.bestTimeToContactTimeZone,
    medicalSpecialties: req.body.medicalSpecialties || [],
    patientVolume: req.body.patientVolume,
    currentSystems: req.body.currentSystems || [],
    complianceRequirements: req.body.complianceRequirements || [],
    integrationRequirements: req.body.integrationRequirements || [],
    integrationRequirementsOther: req.body.integrationRequirementsOther,
    dataSecurityNeeds: req.body.dataSecurityNeeds || [],
    dataSecurityNeedsOther: req.body.dataSecurityNeedsOther,
    primaryChallenges: req.body.primaryChallenges || [],
    primaryChallengesOther: req.body.primaryChallengesOther,
    currentPainPoints: req.body.currentPainPoints || [],
    currentPainPointsOther: req.body.currentPainPointsOther,
    goals: req.body.goals || [],
    goalsOther: req.body.goalsOther,
    interestedSolutionAreas: req.body.interestedSolutionAreas || [],
    specificSolutions: req.body.specificSolutions || [],
    mustHaveFeatures: req.body.mustHaveFeatures || [],
    mustHaveFeaturesOther: req.body.mustHaveFeaturesOther,
    niceToHaveFeatures: req.body.niceToHaveFeatures || [],
    niceToHaveFeaturesOther: req.body.niceToHaveFeaturesOther,
    budgetRange: req.body.budgetRange,
    timeline: req.body.timeline,
    decisionMakers: req.body.decisionMakers || [],
    decisionMakersOther: req.body.decisionMakersOther,
    procurementProcess: req.body.procurementProcess || [],
    procurementProcessOther: req.body.procurementProcessOther,
    additionalNotes: req.body.additionalNotes,
    status: 'submitted',
    submittedAt: new Date(),
  };

  // Remove undefined fields
  Object.keys(institutionData).forEach(key => {
    if (institutionData[key] === undefined) {
      delete institutionData[key];
    }
  });

  // Find existing or create new
  let institution = await HealthcareInstitution.findOne({ userId });
  
  if (institution) {
    // Update existing
    Object.assign(institution, institutionData);
    await institution.save();
  } else {
    // Create new
    institution = await HealthcareInstitution.create(institutionData);
  }

  // Update user profile flags
  const user = await User.findById(userId);
  if (user) {
    user.hasInstitutionProfile = true;
    if (!user.profileCompletedAt) {
      user.profileCompletedAt = new Date();
    }
    await user.save();
  }

  res.status(200).json({
    success: true,
    data: institution,
    message: 'Institution profile saved successfully'
  });
});

/**
 * Get institution profile for current user
 * @route GET /api/institution
 * @access Private
 */
const getInstitution = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const institution = await HealthcareInstitution.findOne({ userId });

  if (!institution) {
    return res.status(200).json({
      success: false,
      data: null,
      message: 'Institution profile not found'
    });
  }

  res.status(200).json({
    success: true,
    data: institution
  });
});

/**
 * Get institution profile by user ID
 * @route GET /api/institution/:userId
 * @access Private
 */
const getInstitutionByUserId = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // Check if requesting user's own profile or admin
  if (userId !== req.user._id.toString() && req.user.role !== 'superadmin') {
    return next(new AppError('Not authorized to access this profile', 403));
  }

  const institution = await HealthcareInstitution.findOne({ userId });

  if (!institution) {
    return res.status(200).json({
      success: false,
      data: null,
      message: 'Institution profile not found'
    });
  }

  res.status(200).json({
    success: true,
    data: institution
  });
});

module.exports = {
  createOrUpdateInstitution,
  getInstitution,
  getInstitutionByUserId
};
