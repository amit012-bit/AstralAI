/**
 * DataField Controller
 * Handles data field management operations
 */

const DataField = require('../models/DataField');
const VendorFieldMapping = require('../models/VendorFieldMapping');
const { AppError, catchAsync } = require('../middleware/errorHandler');

/**
 * Get all available data fields
 * @route GET /api/data-fields
 * @access Private
 */
const getAllDataFields = catchAsync(async (req, res, next) => {
  const { category, section, isActive } = req.query;

  const query = {};
  if (category) query.category = category;
  if (section) query.section = section;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const fields = await DataField.find(query)
    .sort({ category: 1, section: 1, order: 1 });

  res.status(200).json({
    success: true,
    data: fields,
    count: fields.length
  });
});

/**
 * Get fields mapped to a vendor
 * @route GET /api/data-fields/vendor/:vendorId
 * @access Private
 */
const getVendorFields = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;
  const requestingUserId = req.user._id;

  // Check authorization - vendors can only see their own fields
  if (vendorId !== requestingUserId.toString() && req.user.role !== 'superadmin') {
    return next(new AppError('Not authorized to access this vendor\'s fields', 403));
  }

  // Get all default fields + vendor's selected fields
  const defaultFields = await DataField.find({ isDefault: true, isActive: true })
    .sort({ category: 1, section: 1, order: 1 });

  const vendorMappings = await VendorFieldMapping.find({ 
    vendorId, 
    isEnabled: true 
  }).populate('fieldId');

  // Combine default fields and vendor selected fields
  const fieldMap = new Map();
  
  // Add default fields
  defaultFields.forEach(field => {
    fieldMap.set(field._id.toString(), {
      ...field.toObject(),
      isDefault: true,
      isEnabled: true
    });
  });

  // Add/override with vendor mappings
  vendorMappings.forEach(mapping => {
    if (mapping.fieldId) {
      const fieldData = mapping.fieldId.toObject();
      fieldMap.set(fieldData._id.toString(), {
        ...fieldData,
        isDefault: defaultFields.some(df => df._id.toString() === fieldData._id.toString()),
        isEnabled: mapping.isEnabled,
        customLabel: mapping.customLabel,
        customOrder: mapping.customOrder,
        section: mapping.section || fieldData.section,
        mappingId: mapping._id.toString()
      });
    }
  });

  const fields = Array.from(fieldMap.values())
    .sort((a, b) => {
      // Sort by section, then by customOrder or order
      if (a.section !== b.section) {
        return a.section.localeCompare(b.section);
      }
      return (a.customOrder ?? a.order) - (b.customOrder ?? b.order);
    });

  res.status(200).json({
    success: true,
    data: fields,
    count: fields.length
  });
});

/**
 * Update vendor field mappings
 * @route POST /api/data-fields/vendor/:vendorId/mappings
 * @access Private
 */
const updateVendorFieldMappings = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;
  const { fieldIds } = req.body;
  const requestingUserId = req.user._id;

  // Check authorization
  if (vendorId !== requestingUserId.toString() && req.user.role !== 'superadmin') {
    return next(new AppError('Not authorized to update this vendor\'s fields', 403));
  }

  if (!Array.isArray(fieldIds)) {
    return next(new AppError('fieldIds must be an array', 400));
  }

  // Get all default fields - these should always be enabled
  const defaultFields = await DataField.find({ isDefault: true, isActive: true });
  const defaultFieldIds = defaultFields.map(f => f._id.toString());

  // Combine default fields with selected fields
  const allFieldIds = [...new Set([...defaultFieldIds, ...fieldIds])];

  // Validate all field IDs exist
  const validFields = await DataField.find({ 
    _id: { $in: allFieldIds },
    isActive: true 
  });
  
  if (validFields.length !== allFieldIds.length) {
    return next(new AppError('Some field IDs are invalid', 400));
  }

  // Remove existing mappings for this vendor
  await VendorFieldMapping.deleteMany({ vendorId });

  // Create new mappings for selected fields (excluding defaults which are auto-enabled)
  const newFieldIds = allFieldIds.filter(id => !defaultFieldIds.includes(id));
  const mappings = newFieldIds.map(fieldId => ({
    vendorId,
    fieldId,
    fieldKey: validFields.find(f => f._id.toString() === fieldId)?.fieldKey,
    isEnabled: true
  }));

  if (mappings.length > 0) {
    await VendorFieldMapping.insertMany(mappings);
  }

  // Return updated field list
  const result = await VendorFieldMapping.find({ vendorId, isEnabled: true })
    .populate('fieldId');

  const fields = defaultFields.map(f => f.toObject()).concat(
    result.map(m => m.fieldId.toObject())
  );

  res.status(200).json({
    success: true,
    message: 'Field mappings updated successfully',
    data: fields,
    count: fields.length
  });
});

module.exports = {
  getAllDataFields,
  getVendorFields,
  updateVendorFieldMappings
};
