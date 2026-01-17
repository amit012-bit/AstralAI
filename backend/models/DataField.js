/**
 * DataField Model
 * Stores all possible fields that can be used for vendor details and other information
 */

const mongoose = require('mongoose');

const dataFieldSchema = new mongoose.Schema({
  fieldKey: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  fieldLabel: {
    type: String,
    required: true,
    trim: true,
  },
  fieldType: {
    type: String,
    required: true,
    enum: ['text', 'textarea', 'email', 'tel', 'url', 'select', 'number', 'date', 'checkbox'],
    default: 'text',
  },
  category: {
    type: String,
    required: true,
    trim: true,
    default: 'vendor_details', // vendor_details, contact_info, company_info, etc.
  },
  section: {
    type: String,
    required: true,
    trim: true,
    default: 'basic', // basic, location, contact, additional
  },
  isDefault: {
    type: Boolean,
    default: false, // Basic fields that should always be included
  },
  isRequired: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    trim: true,
  },
  options: [{
    // For select fields
    label: String,
    value: String,
  }],
  validation: {
    minLength: Number,
    maxLength: Number,
    pattern: String, // Regex pattern
  },
  order: {
    type: Number,
    default: 0, // Display order within section
  },
  parentField: {
    type: String,
    trim: true,
    // For nested fields like location.state, location.country
  },
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
dataFieldSchema.index({ category: 1, section: 1, order: 1 });
dataFieldSchema.index({ isDefault: 1, isActive: 1 });

module.exports = mongoose.model('DataField', dataFieldSchema);
