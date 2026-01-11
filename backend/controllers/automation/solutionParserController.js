/**
 * Solution Parser Controller
 * Handles website parsing and AI-powered solution data extraction
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
    const promptPath = join(__dirname, '../../prompts/solution-parser', `${promptName}.txt`);
    const promptContent = readFileSync(promptPath, 'utf-8');
    return promptContent;
  } catch (error) {
    console.error(`Error loading prompt ${promptName}:`, error);
    // Return a default prompt if file doesn't exist
    return getDefaultPrompt(promptName);
  }
}

/**
 * Get default prompt if file doesn't exist
 */
function getDefaultPrompt(promptName) {
  // Basic prompt for solution extraction
  return `Extract the following information from the website content and return it as JSON:

{{WEBSITE_CONTENT}}

Please extract:
- title: Solution/product name
- shortDescription: Brief description (under 200 characters)
- description: Detailed description
- category: Main category (e.g., Machine Learning, NLP, Computer Vision)
- industry: Primary industry (e.g., Healthcare, Finance, Education)
- tags: Array of relevant tags
- features: Array of key features with name and description
- pricing: Pricing information if available
- deployment: Deployment type information
- capabilities: Array of capabilities
- technologies: Array of technologies used

Return only valid JSON.`;
}

/**
 * Extract solution data from website content using AI
 */
async function extractSolutionData(websiteContent) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    const promptTemplate = loadPrompt('solution-extraction');
    const prompt = promptTemplate.replace('{{WEBSITE_CONTENT}}', websiteContent);

    console.log('Extracting solution data from website...');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that extracts structured data from website content. Always return valid JSON that matches solution listing format.",
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
    
    console.log('Successfully extracted solution data');
    return parsedData;
  } catch (error) {
    console.error('Error extracting solution data:', error);
    throw error;
  }
}

/**
 * Parse website and extract solution data (Non-streaming)
 * POST /api/automation/solutions/parse-website
 */
exports.parseWebsite = catchAsync(async (req, res, next) => {
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

    // Extract solution data using OpenAI
    const solutionData = await extractSolutionData(websiteContent);

    // Ensure URL is included
    solutionData.websiteUrl = validUrl.toString();

    // Normalize the data structure to match Solution model
    const normalizedData = normalizeSolutionData(solutionData);

    res.status(200).json({
      success: true,
      data: normalizedData,
    });
  } catch (error) {
    console.error('Error parsing website:', error);
    return next(new AppError(error.message || 'Failed to parse website', 500));
  }
});

/**
 * Normalize extracted data to match Solution model structure
 */
function normalizeSolutionData(data) {
  return {
    title: data.title || '',
    shortDescription: data.shortDescription || data.description?.substring(0, 200) || '',
    description: data.description || '',
    category: data.category || '',
    industry: data.industry || '',
    subcategory: data.subcategory || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    features: Array.isArray(data.features) 
      ? data.features.map(f => ({
          name: f.name || f.title || f,
          description: f.description || '',
          icon: f.icon || ''
        }))
      : [],
    pricing: data.pricing || {
      model: data.pricingModel || 'contact',
      price: data.price || 0,
      currency: data.currency || 'USD',
      billingCycle: data.billingCycle || 'monthly',
      customPricing: {
        available: false,
        description: ''
      }
    },
    deployment: data.deployment || {
      type: data.deploymentType || '',
      time: data.implementationTime || '',
      description: data.deploymentDescription || '',
      complexity: ''
    },
    capabilities: Array.isArray(data.capabilities) ? data.capabilities : [],
    technologies: Array.isArray(data.technologies) ? data.technologies : [],
    integrationRequirements: data.integrationRequirements || '',
    contactInfo: {
      email: data.email || data.contactEmail || '',
      phone: data.phone || data.contactPhone || '',
      address: data.address || '',
      demoUrl: data.demoUrl || data.websiteUrl || '',
      documentationUrl: data.documentationUrl || ''
    },
    // Additional fields
    valuePropositions: Array.isArray(data.valuePropositions) ? data.valuePropositions : [],
    useCases: Array.isArray(data.useCases) ? data.useCases : [],
    implementationTime: data.implementationTime || ''
  };
}
