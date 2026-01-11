/**
 * HealthcareInstitution Model
 * Stores healthcare institution profiles and questionnaire data
 */

const mongoose = require('mongoose');

const healthcareInstitutionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    selectedAISolutions: [{
      type: String,
      trim: true,
    }],
    institutionName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    institutionType: {
      type: String,
      required: true,
      enum: ['Hospital', 'Clinic', 'Health System', 'Medical Group', 'Specialty Practice', 'Urgent Care', 'Other'],
    },
    location: {
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, default: 'United States', trim: true },
    },
    primaryContact: {
      name: { type: String, required: true, trim: true },
      title: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
    },
    secondaryContact: {
      name: { type: String, trim: true },
      title: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
    },
    preferredContactMethod: {
      type: String,
      enum: ['Email', 'Phone', 'Video Call', 'In-Person'],
      default: 'Email',
    },
    bestTimeToContact: {
      type: String,
      trim: true,
    },
    bestTimeToContactDays: {
      type: String,
      trim: true,
    },
    bestTimeToContactStartTime: {
      type: String,
      trim: true,
    },
    bestTimeToContactEndTime: {
      type: String,
      trim: true,
    },
    bestTimeToContactTimeZone: {
      type: String,
      trim: true,
    },
    medicalSpecialties: [{
      type: String,
      trim: true,
    }],
    patientVolume: {
      type: String,
      trim: true,
    },
    currentSystems: [{
      type: String,
      trim: true,
    }],
    complianceRequirements: [{
      type: String,
      enum: ['HIPAA', 'HITECH', 'GDPR', 'SOC 2', 'HITRUST', 'Other'],
    }],
    integrationRequirements: [{
      type: String,
      trim: true,
    }],
    integrationRequirementsOther: { type: String, trim: true, maxlength: 500 },
    dataSecurityNeeds: [{
      type: String,
      trim: true,
    }],
    dataSecurityNeedsOther: { type: String, trim: true, maxlength: 500 },
    primaryChallenges: [{
      type: String,
      trim: true,
    }],
    primaryChallengesOther: { type: String, trim: true, maxlength: 500 },
    currentPainPoints: [{
      type: String,
      trim: true,
    }],
    currentPainPointsOther: { type: String, trim: true, maxlength: 500 },
    goals: [{
      type: String,
      trim: true,
    }],
    goalsOther: { type: String, trim: true, maxlength: 500 },
    interestedSolutionAreas: [{
      type: String,
      trim: true,
    }],
    specificSolutions: [{
      type: String,
      trim: true,
    }],
    mustHaveFeatures: [{
      type: String,
      trim: true,
    }],
    mustHaveFeaturesOther: { type: String, trim: true, maxlength: 500 },
    niceToHaveFeatures: [{
      type: String,
      trim: true,
    }],
    niceToHaveFeaturesOther: { type: String, trim: true, maxlength: 500 },
    budgetRange: {
      type: String,
      enum: ['$0 - $50,000', '$50,000 - $100,000', '$100,000 - $500,000', '$500,000 - $1,000,000', '$1,000,000+', 'Not specified'],
    },
    timeline: {
      type: String,
      enum: ['Immediate', '1-3 months', '3-6 months', '6-12 months', '12+ months', 'Exploring options'],
    },
    decisionMakers: [{
      type: String,
      trim: true,
    }],
    decisionMakersOther: { type: String, trim: true, maxlength: 500 },
    procurementProcess: [{
      type: String,
      trim: true,
    }],
    procurementProcessOther: { type: String, trim: true, maxlength: 500 },
    additionalNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'reviewed', 'matched'],
      default: 'draft',
    },
    submittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'healthcareinstitutions',
  }
);

// Create indexes
healthcareInstitutionSchema.index({ userId: 1 });
healthcareInstitutionSchema.index({ status: 1 });
healthcareInstitutionSchema.index({ institutionType: 1 });

const HealthcareInstitution = mongoose.models.HealthcareInstitution || mongoose.model('HealthcareInstitution', healthcareInstitutionSchema);

module.exports = HealthcareInstitution;
