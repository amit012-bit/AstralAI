/**
 * VendorFieldMapping Model
 * Stores which fields each vendor has chosen to display
 */

const mongoose = require('mongoose');

const vendorFieldMappingSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  fieldId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DataField',
    required: true,
    index: true,
  },
  fieldKey: {
    type: String,
    required: true,
    // Denormalized for easier queries
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
  customLabel: {
    type: String,
    trim: true,
    // Allow vendor to customize label
  },
  customOrder: {
    type: Number,
    // Allow vendor to customize order
  },
  section: {
    type: String,
    trim: true,
    // Custom section name if vendor wants to organize differently
  },
}, {
  timestamps: true,
});

// Compound index for unique vendor-field combination
vendorFieldMappingSchema.index({ vendorId: 1, fieldId: 1 }, { unique: true });
vendorFieldMappingSchema.index({ vendorId: 1, section: 1, customOrder: 1 });

module.exports = mongoose.model('VendorFieldMapping', vendorFieldMappingSchema);
