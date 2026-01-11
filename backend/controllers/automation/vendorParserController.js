/**
 * Vendor Parser Controller
 * Handles website parsing and AI-powered vendor data extraction
 * Extracts vendor company info, contact info, and multiple products
 */

const { scrapeWebsite } = require('../../services/automation/websiteScraper');
const OpenAI = require('openai');
const { readFileSync } = require('fs');
const { join } = require('path');
const { AppError, catchAsync } = require('../../middleware/errorHandler');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Load prompt template from file
 */
function loadPrompt(promptName) {
  try {
    const promptPath = join(__dirname, '../../prompts/vendor-parser', `${promptName}.txt`);
    const promptContent = readFileSync(promptPath, 'utf-8');
    return promptContent;
  } catch (error) {
    console.error(`Error loading prompt ${promptName}:`, error);
    throw new Error(`Failed to load prompt: ${promptName}`);
  }
}

/**
 * Extract section data from website content using AI
 */
async function extractSectionData(websiteContent, promptName, sectionName) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    const promptTemplate = loadPrompt(promptName);
    const prompt = promptTemplate.replace('{{WEBSITE_CONTENT}}', websiteContent);

    console.log(`Extracting ${sectionName}...`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that extracts structured data from website content. Always return valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const parsedData = JSON.parse(responseText);
    
    console.log(`Successfully extracted ${sectionName}`);
    return parsedData;
  } catch (error) {
    console.error(`Error extracting ${sectionName}:`, error);
    // Return empty structure for this section if extraction fails
    return getEmptySectionData(sectionName);
  }
}

/**
 * Get empty data structure for a section
 */
function getEmptySectionData(sectionName) {
  switch (sectionName) {
    case 'company-overview':
      return {
        companyName: "",
        companyType: "",
        companyTypeOther: "",
        location: { state: "", country: "United States", countryOther: "" },
        website: "",
        address: ""
      };
    case 'product-information':
      return { products: [] };
    case 'integrations':
      return {
        integrationCategories: {
          EHRs: [],
          Payments: [],
          Forms: [],
          Communication: [],
          Analytics: []
        },
        otherIntegrationsByCategory: {
          EHRs: "",
          Payments: "",
          Forms: "",
          Communication: "",
          Analytics: ""
        },
        otherIntegrations: ""
      };
    case 'contact-information':
      return {
        primaryContact: {
          name: "",
          title: "",
          email: "",
          phone: ""
        }
      };
    case 'compliance-certifications':
      return {
        complianceCertifications: [],
        complianceCertificationsOther: ""
      };
    default:
      return {};
  }
}

/**
 * Extract vendor data from website content
 */
async function extractVendorData(websiteContent) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  console.log("Starting vendor data extraction...");

  // Extract data from each section in parallel (matching solutions-hub-main)
  const sections = [
    { promptName: '01-company-overview', sectionName: 'company-overview' },
    { promptName: '02-product-information', sectionName: 'product-information' },
    { promptName: '03-integrations', sectionName: 'integrations' },
    { promptName: '04-contact-information', sectionName: 'contact-information' },
    { promptName: '05-compliance-certifications', sectionName: 'compliance-certifications' },
  ];

  const extractionPromises = sections.map(({ promptName, sectionName }) =>
    extractSectionData(websiteContent, promptName, sectionName)
  );

  const results = await Promise.all(extractionPromises);

  // Combine all results into a single object
  const combinedData = {
    ...results[0], // company-overview
    ...results[1], // product-information
    ...results[2], // integrations
    ...results[3], // contact-information
    ...results[4], // compliance-certifications
  };

  console.log("Completed vendor data extraction");
  return combinedData;
}

/**
 * Parse vendor website and extract vendor info + products
 * POST /api/automation/vendor/parse-website
 */
exports.parseVendorWebsite = catchAsync(async (req, res, next) => {
  // Check authentication
  if (!req.user) {
    return next(new AppError('Unauthorized', 401));
  }

  // Check if user is vendor or superadmin
  if (req.user.role !== 'vendor' && req.user.role !== 'superadmin') {
    return next(new AppError('Only vendors and superadmins can parse websites', 403));
  }

  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return next(new AppError('URL is required', 400));
  }

  // Validate URL format
  let validUrl;
  try {
    validUrl = new URL(url);
    if (!['http:', 'https:'].includes(validUrl.protocol)) {
      throw new Error('Invalid protocol');
    }
  } catch (error) {
    return next(new AppError('Invalid URL format', 400));
  }

  try {
    // Scrape website
    const websiteContent = await scrapeWebsite(validUrl.toString());

    // Extract vendor data using OpenAI
    const vendorData = await extractVendorData(websiteContent);

    // Ensure website field is set
    vendorData.website = validUrl.toString();

    // Ensure products array is valid and each product has required fields
    if (vendorData.products && Array.isArray(vendorData.products)) {
      vendorData.products = vendorData.products
        .filter((p) => p && (p.name || p.description || p.overview)) // Filter out invalid products
        .map((p) => {
          // Handle both old format (overview) and new format (description + shortDescription)
          const fullDescription = p.description || p.overview || "";
          const shortDescription = p.shortDescription || (fullDescription ? fullDescription.substring(0, 200).replace(/\.[^.]*$/, '') : "");
          
          return {
            name: p.name || "Unnamed Product",
            shortDescription: shortDescription,
            description: fullDescription,
            url: p.url || "" // Include product URL if available
          };
        })
        .filter((p) => p.description.length >= 200 && p.shortDescription.length > 0); // Only include products with sufficient description
    } else {
      vendorData.products = [];
    }

    // Process integrationCategories - ensure it's properly formatted
    if (!vendorData.integrationCategories) {
      vendorData.integrationCategories = {};
    }

    // Ensure each category is an array and filter out empty values
    const categories = ["EHRs", "Payments", "Forms", "Communication", "Analytics"];
    categories.forEach((category) => {
      if (!vendorData.integrationCategories[category]) {
        vendorData.integrationCategories[category] = [];
      } else if (!Array.isArray(vendorData.integrationCategories[category])) {
        // Convert to array if it's not
        vendorData.integrationCategories[category] = [vendorData.integrationCategories[category]];
      }
      // Filter out empty strings and normalize
      vendorData.integrationCategories[category] = vendorData.integrationCategories[category]
        .filter((item) => item && typeof item === "string" && item.trim().length > 0)
        .map((item) => item.trim());
    });

    // Process otherIntegrationsByCategory - ensure it's properly formatted
    if (!vendorData.otherIntegrationsByCategory) {
      vendorData.otherIntegrationsByCategory = {};
    }

    // Ensure each category has a string value
    categories.forEach((category) => {
      if (!vendorData.otherIntegrationsByCategory[category]) {
        vendorData.otherIntegrationsByCategory[category] = "";
      } else if (Array.isArray(vendorData.otherIntegrationsByCategory[category])) {
        // Convert array to comma-separated string
        vendorData.otherIntegrationsByCategory[category] = vendorData.otherIntegrationsByCategory[category]
          .filter((item) => item && typeof item === "string" && item.trim().length > 0)
          .map((item) => item.trim())
          .join(", ");
      } else if (typeof vendorData.otherIntegrationsByCategory[category] !== "string") {
        vendorData.otherIntegrationsByCategory[category] = String(vendorData.otherIntegrationsByCategory[category] || "").trim();
      }
    });

    // Ensure otherIntegrations is a string
    if (vendorData.otherIntegrations && Array.isArray(vendorData.otherIntegrations)) {
      vendorData.otherIntegrations = vendorData.otherIntegrations.join(", ");
    } else if (!vendorData.otherIntegrations) {
      vendorData.otherIntegrations = "";
    }

    // Ensure complianceCertifications is an array
    if (!vendorData.complianceCertifications) {
      vendorData.complianceCertifications = [];
    } else if (!Array.isArray(vendorData.complianceCertifications)) {
      vendorData.complianceCertifications = [vendorData.complianceCertifications];
    }

    // Ensure complianceCertificationsOther is a string
    if (!vendorData.complianceCertificationsOther) {
      vendorData.complianceCertificationsOther = "";
    } else if (Array.isArray(vendorData.complianceCertificationsOther)) {
      vendorData.complianceCertificationsOther = vendorData.complianceCertificationsOther.join(", ");
    }

    res.status(200).json({
      success: true,
      message: 'Website parsed successfully',
      data: vendorData,
    });
  } catch (error) {
    console.error('Error parsing vendor website:', error);
    return next(new AppError(error.message || 'Failed to parse vendor website', 500));
  }
});
