/**
 * Companies Routes - Handle company-related operations
 * Provides endpoints for fetching companies (for superadmin use)
 */

const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const { authenticate, authorize } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');


// Get all companies (for superadmin to select when creating solutions)
router.get('/', authenticate, authorize('superadmin'), catchAsync(async (req, res, next) => {
  const companies = await Company.find({})
    .select('name description website industry logo')
    .sort({ name: 1 });

  res.json({
    success: true,
    data: companies
  });
}));

// Get company by ID
router.get('/:id', authenticate, authorize('superadmin'), catchAsync(async (req, res, next) => {
  const company = await Company.findById(req.params.id)
    .select('name description website industry logo');

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }

  res.json({
    success: true,
    data: company
  });
}));

module.exports = router;
