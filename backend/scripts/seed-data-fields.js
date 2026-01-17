/**
 * Seed Data Fields
 * Populates the DataField collection with all vendor detail fields
 */

const mongoose = require('mongoose');
require('dotenv').config();

const DataField = require('../models/DataField');

const dataFields = [
  // Basic Company Information
  {
    fieldKey: 'companyName',
    fieldLabel: 'Company Name',
    fieldType: 'text',
    category: 'vendor_details',
    section: 'basic',
    isDefault: true,
    isRequired: true,
    placeholder: 'Enter company name',
    order: 1
  },
  {
    fieldKey: 'companyType',
    fieldLabel: 'Company Type',
    fieldType: 'select',
    category: 'vendor_details',
    section: 'basic',
    isDefault: true,
    isRequired: true,
    options: [
      { label: 'Startup', value: 'Startup' },
      { label: 'SME', value: 'SME' },
      { label: 'Enterprise', value: 'Enterprise' },
      { label: 'Other', value: 'Other' }
    ],
    order: 2
  },
  {
    fieldKey: 'companyTypeOther',
    fieldLabel: 'Specify Company Type',
    fieldType: 'text',
    category: 'vendor_details',
    section: 'basic',
    isDefault: false,
    isRequired: false,
    placeholder: 'Enter company type',
    parentField: 'companyType',
    order: 3
  },
  {
    fieldKey: 'website',
    fieldLabel: 'Website URL',
    fieldType: 'url',
    category: 'vendor_details',
    section: 'basic',
    isDefault: true,
    isRequired: true,
    placeholder: 'https://example.com',
    order: 4
  },

  // Location Information
  {
    fieldKey: 'location.state',
    fieldLabel: 'State',
    fieldType: 'text',
    category: 'vendor_details',
    section: 'location',
    isDefault: true,
    isRequired: true,
    placeholder: 'e.g., California',
    order: 1
  },
  {
    fieldKey: 'location.country',
    fieldLabel: 'Country',
    fieldType: 'select',
    category: 'vendor_details',
    section: 'location',
    isDefault: true,
    isRequired: true,
    options: [
      { label: 'United States', value: 'United States' },
      { label: 'Canada', value: 'Canada' },
      { label: 'United Kingdom', value: 'United Kingdom' },
      { label: 'Australia', value: 'Australia' },
      { label: 'Germany', value: 'Germany' },
      { label: 'France', value: 'France' },
      { label: 'Italy', value: 'Italy' },
      { label: 'Spain', value: 'Spain' },
      { label: 'Netherlands', value: 'Netherlands' },
      { label: 'Belgium', value: 'Belgium' },
      { label: 'Switzerland', value: 'Switzerland' },
      { label: 'Austria', value: 'Austria' },
      { label: 'Sweden', value: 'Sweden' },
      { label: 'Norway', value: 'Norway' },
      { label: 'Denmark', value: 'Denmark' },
      { label: 'Finland', value: 'Finland' },
      { label: 'Japan', value: 'Japan' },
      { label: 'South Korea', value: 'South Korea' },
      { label: 'Singapore', value: 'Singapore' },
      { label: 'India', value: 'India' },
      { label: 'China', value: 'China' },
      { label: 'Brazil', value: 'Brazil' },
      { label: 'Mexico', value: 'Mexico' },
      { label: 'Other', value: 'Other' }
    ],
    order: 2
  },
  {
    fieldKey: 'location.countryOther',
    fieldLabel: 'Specify Country',
    fieldType: 'text',
    category: 'vendor_details',
    section: 'location',
    isDefault: false,
    isRequired: false,
    placeholder: 'Enter country',
    parentField: 'location.country',
    order: 3
  },
  {
    fieldKey: 'address',
    fieldLabel: 'Address',
    fieldType: 'textarea',
    category: 'vendor_details',
    section: 'location',
    isDefault: true,
    isRequired: false,
    placeholder: 'Full company address',
    order: 4
  },

  // Primary Contact Information
  {
    fieldKey: 'primaryContact.name',
    fieldLabel: 'Contact Name',
    fieldType: 'text',
    category: 'vendor_details',
    section: 'contact',
    isDefault: true,
    isRequired: true,
    placeholder: 'Full name',
    order: 1
  },
  {
    fieldKey: 'primaryContact.title',
    fieldLabel: 'Contact Title',
    fieldType: 'text',
    category: 'vendor_details',
    section: 'contact',
    isDefault: true,
    isRequired: true,
    placeholder: 'e.g., CEO, Sales Director',
    order: 2
  },
  {
    fieldKey: 'primaryContact.email',
    fieldLabel: 'Contact Email',
    fieldType: 'email',
    category: 'vendor_details',
    section: 'contact',
    isDefault: true,
    isRequired: true,
    placeholder: 'contact@company.com',
    order: 3
  },
  {
    fieldKey: 'primaryContact.phone',
    fieldLabel: 'Contact Phone',
    fieldType: 'tel',
    category: 'vendor_details',
    section: 'contact',
    isDefault: true,
    isRequired: true,
    placeholder: '+1 (555) 123-4567',
    order: 4
  },

  // Additional Fields (not default)
  {
    fieldKey: 'foundedYear',
    fieldLabel: 'Founded Year',
    fieldType: 'number',
    category: 'vendor_details',
    section: 'additional',
    isDefault: false,
    isRequired: false,
    placeholder: 'e.g., 2020',
    validation: {
      minLength: 1900,
      maxLength: new Date().getFullYear()
    },
    order: 1
  },
  {
    fieldKey: 'companySize',
    fieldLabel: 'Company Size',
    fieldType: 'select',
    category: 'vendor_details',
    section: 'additional',
    isDefault: false,
    isRequired: false,
    options: [
      { label: '1-10', value: '1-10' },
      { label: '11-50', value: '11-50' },
      { label: '51-200', value: '51-200' },
      { label: '201-1000', value: '201-1000' },
      { label: '1000+', value: '1000+' }
    ],
    order: 2
  },
  {
    fieldKey: 'secondaryContact.name',
    fieldLabel: 'Secondary Contact Name',
    fieldType: 'text',
    category: 'vendor_details',
    section: 'contact',
    isDefault: false,
    isRequired: false,
    placeholder: 'Full name',
    order: 5
  },
  {
    fieldKey: 'secondaryContact.title',
    fieldLabel: 'Secondary Contact Title',
    fieldType: 'text',
    category: 'vendor_details',
    section: 'contact',
    isDefault: false,
    isRequired: false,
    placeholder: 'e.g., COO, VP of Sales',
    order: 6
  },
  {
    fieldKey: 'secondaryContact.email',
    fieldLabel: 'Secondary Contact Email',
    fieldType: 'email',
    category: 'vendor_details',
    section: 'contact',
    isDefault: false,
    isRequired: false,
    placeholder: 'contact2@company.com',
    order: 7
  },
  {
    fieldKey: 'secondaryContact.phone',
    fieldLabel: 'Secondary Contact Phone',
    fieldType: 'tel',
    category: 'vendor_details',
    section: 'contact',
    isDefault: false,
    isRequired: false,
    placeholder: '+1 (555) 987-6543',
    order: 8
  },
  {
    fieldKey: 'preferredContactMethod',
    fieldLabel: 'Preferred Contact Method',
    fieldType: 'select',
    category: 'vendor_details',
    section: 'contact',
    isDefault: false,
    isRequired: false,
    options: [
      { label: 'Email', value: 'Email' },
      { label: 'Phone', value: 'Phone' },
      { label: 'Video Call', value: 'Video Call' },
      { label: 'In-Person', value: 'In-Person' }
    ],
    order: 9
  }
];

async function seedDataFields() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_solutions_marketplace';
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data fields
    await DataField.deleteMany({});
    console.log('🗑️  Cleared existing data fields');

    // Insert data fields
    const insertedFields = await DataField.insertMany(dataFields);
    console.log(`✅ Seeded ${insertedFields.length} data fields`);

    // Display summary
    const defaultCount = dataFields.filter(f => f.isDefault).length;
    const additionalCount = dataFields.filter(f => !f.isDefault).length;
    console.log(`\n📊 Summary:`);
    console.log(`   - Default fields: ${defaultCount}`);
    console.log(`   - Additional fields: ${additionalCount}`);
    console.log(`   - Total fields: ${insertedFields.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data fields:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDataFields();
}

module.exports = { seedDataFields, dataFields };
