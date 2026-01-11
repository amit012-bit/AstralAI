/**
 * Database Seeding Script
 * Populates the database with sample data for testing and demonstration
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Company = require('../models/Company');
const Solution = require('../models/Solution');
const Query = require('../models/Query');
const Blog = require('../models/Blog');
const Review = require('../models/Review');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_solutions_marketplace');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    await Solution.deleteMany({});
    await Query.deleteMany({});
    await Blog.deleteMany({});
    await Review.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create sample companies
    const companies = [
      {
        name: 'TechBot Solutions',
        slug: 'techbot-solutions',
        description: 'Leading provider of AI-powered customer service solutions with 99.9% uptime.',
        website: 'https://techbot.ai',
        industry: 'Technology',
        companySize: '51-200',
        email: 'contact@techbot.ai',
        phone: '+1-555-TECH-BOT',
        categories: ['Customer Service', 'AI Chatbots', 'Automation'],
        isVerified: true,
        rating: { average: 4.8, count: 156 }
      },
      {
        name: 'DataFlow AI',
        slug: 'dataflow-ai',
        description: 'Advanced predictive analytics and machine learning solutions for enterprise.',
        website: 'https://dataflow.ai',
        industry: 'Technology',
        companySize: '201-500',
        email: 'info@dataflow.ai',
        phone: '+1-555-DATA-FLW',
        categories: ['Predictive Analytics', 'Machine Learning', 'Data Science'],
        isVerified: true,
        rating: { average: 4.6, count: 89 }
      },
      {
        name: 'MedTech AI',
        slug: 'medtech-ai',
        description: 'Revolutionary AI solutions for healthcare and medical imaging.',
        website: 'https://medtech.ai',
        industry: 'Healthcare',
        companySize: '11-50',
        email: 'hello@medtech.ai',
        phone: '+1-555-MED-TECH',
        categories: ['Healthcare', 'Medical AI', 'Computer Vision'],
        isVerified: true,
        rating: { average: 4.9, count: 234 }
      },
      {
        name: 'RetailAI Pro',
        slug: 'retailai-pro',
        description: 'Smart recommendation engines and inventory optimization for retail.',
        website: 'https://retailai.pro',
        industry: 'E-commerce',
        companySize: '51-200',
        email: 'sales@retailai.pro',
        phone: '+1-555-RETAIL-AI',
        categories: ['E-commerce', 'Recommendation Systems', 'Retail Tech'],
        isVerified: false,
        rating: { average: 4.5, count: 67 }
      }
    ];

    const createdCompanies = await Company.insertMany(companies);
    console.log(`✅ Created ${createdCompanies.length} companies`);

    // Hash passwords before creating users
    const saltRounds = 12;
    const hashedPasswords = {
      superAdmin: await bcrypt.hash('SuperAdmin@#123', saltRounds),
      password123: await bcrypt.hash('password123', saltRounds)
    };

    // Create sample users
    const users = [
      {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'SuperAdmin@medicodio.com',
        password: hashedPasswords.superAdmin,
        role: 'superadmin',
        isEmailVerified: true,
        isActive: true,
        phone: '+1-555-123-4567',
        bio: 'System Administrator for AI SolutionsHub'
      },
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@techbot.ai',
        password: hashedPasswords.password123,
        role: 'vendor',
        companyId: createdCompanies[0]._id,
        isEmailVerified: true,
        isActive: true,
        phone: '+1-555-010-0001',
        bio: 'CEO and Founder of TechBot Solutions'
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@dataflow.ai',
        password: hashedPasswords.password123,
        role: 'vendor',
        companyId: createdCompanies[1]._id,
        isEmailVerified: true,
        isActive: true,
        phone: '+1-555-010-0002',
        bio: 'Head of Product at DataFlow AI'
      },
      {
        firstName: 'Dr. Michael',
        lastName: 'Chen',
        email: 'michael@medtech.ai',
        password: hashedPasswords.password123,
        role: 'vendor',
        companyId: createdCompanies[2]._id,
        isEmailVerified: true,
        isActive: true,
        phone: '+1-555-010-0003',
        bio: 'Chief Medical Officer at MedTech AI'
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@company.com',
        password: hashedPasswords.password123,
        role: 'customer',
        industry: 'Healthcare',
        interests: ['AI', 'Healthcare', 'Automation'],
        isEmailVerified: true,
        isActive: true,
        phone: '+1-555-020-0001',
        bio: 'CTO at HealthCorp looking for AI solutions'
      },
      {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@retail.com',
        password: hashedPasswords.password123,
        role: 'customer',
        industry: 'E-commerce',
        interests: ['Machine Learning', 'E-commerce', 'Analytics'],
        isEmailVerified: true,
        isActive: true,
        phone: '+1-555-020-0002',
        bio: 'VP of Technology at MegaRetail'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create sample solutions
    const solutions = [
      {
        title: 'AI Customer Service Bot',
        slug: 'ai-customer-service-bot',
        shortDescription: 'Automate customer support with intelligent responses and 24/7 availability.',
        description: 'Our AI Customer Service Bot uses advanced natural language processing to provide instant, accurate responses to customer inquiries. Features include sentiment analysis, multi-language support, and seamless integration with existing CRM systems.',
        category: 'Chatbots',
        industry: 'E-commerce',
        companyId: createdCompanies[0]._id,
        vendorId: createdUsers[1]._id,
        pricing: {
          model: 'subscription',
          price: { amount: 99, currency: 'USD', period: 'monthly' },
          freeTrial: { available: true, duration: '14 days' }
        },
        deployment: {
          type: 'cloud',
          setupTime: '24 hours',
          integrationComplexity: 'low'
        },
        features: [
          { title: '24/7 Availability', description: 'Always-on customer support' },
          { title: 'Multi-language Support', description: 'Supports 50+ languages' },
          { title: 'Sentiment Analysis', description: 'Understands customer emotions' },
          { title: 'CRM Integration', description: 'Seamless CRM connectivity' }
        ],
        tags: ['customer-service', 'chatbot', 'automation', 'nlp'],
        capabilities: ['Natural Language Processing', 'Sentiment Analysis', 'Multi-language Support'],
        technologies: ['Python', 'TensorFlow', 'OpenAI GPT', 'React'],
        status: 'approved',
        isActive: true,
        isFeatured: true,
        rating: { average: 4.8, count: 156 },
        views: 2341,
        likes: 89,
        inquiries: 23,
        // Customer-focused metrics
        valuePropositions: [
          'Reduces customer support costs by 70%',
          'Boosts response time from hours to seconds',
          'Handles 1000+ concurrent conversations'
        ],
        performanceMetrics: [
          { metric: 'Response Time', value: '<2 seconds', description: 'Instant customer support' },
          { metric: 'Accuracy Rate', value: '95%', description: 'High precision in understanding queries' },
          { metric: 'Uptime', value: '99.9%', description: 'Reliable 24/7 availability' }
        ],
        aiTechnology: {
          approach: 'Large Language Models (GPT-4)',
          model: 'Custom Neural Network',
          accuracy: '95% accuracy, 99.9% uptime',
          processingTime: '<2 seconds response time'
        },
        useCases: [
          'Perfect for E-commerce Customer Support',
          'Ideal for SaaS Help Desks',
          'Optimized for Financial Services'
        ],
        integrationHighlights: [
          'Seamless API Integration',
          'Works with Salesforce, HubSpot, Zendesk',
          'One-Click Deployment'
        ],
        trustIndicators: [
          'Used by Fortune 500 Companies',
          'SOC 2 Type II Certified',
          'GDPR Compliant'
        ],
        quickBenefits: [
          'Saves 20 hours/week on support tickets',
          'Increases customer satisfaction by 40%',
          'Reduces support costs by 70%'
        ],
        implementationTime: 'Deploy in 15 minutes, No-code setup required'
      },
      {
        title: 'Predictive Analytics Platform',
        slug: 'predictive-analytics-platform',
        shortDescription: 'Make data-driven decisions with AI-powered insights and forecasting.',
        description: 'Advanced predictive analytics platform that helps businesses forecast trends, optimize operations, and make data-driven decisions. Includes machine learning models, automated reporting, and real-time dashboards.',
        category: 'Predictive Analytics',
        industry: 'Finance',
        companyId: createdCompanies[1]._id,
        vendorId: createdUsers[2]._id,
        pricing: {
          model: 'contact',
          customPricing: { available: true, description: 'Custom pricing based on data volume' }
        },
        deployment: {
          type: 'hybrid',
          setupTime: '2-4 weeks',
          integrationComplexity: 'high'
        },
        features: [
          { title: 'Real-time Forecasting', description: 'Live predictive models' },
          { title: 'Automated Reporting', description: 'Scheduled insights delivery' },
          { title: 'Custom Dashboards', description: 'Tailored visualization' },
          { title: 'API Integration', description: 'Connect any data source' }
        ],
        tags: ['predictive-analytics', 'machine-learning', 'forecasting', 'data-science'],
        capabilities: ['Time Series Forecasting', 'Machine Learning', 'Data Visualization'],
        technologies: ['Python', 'R', 'Apache Spark', 'Kubernetes'],
        status: 'approved',
        isActive: true,
        isFeatured: true,
        rating: { average: 4.6, count: 89 },
        views: 1876,
        likes: 45,
        inquiries: 18,
        // Customer-focused metrics
        valuePropositions: [
          'Increases forecast accuracy by 85%',
          'Reduces manual analysis time by 90%',
          'Identifies market trends 6 months ahead'
        ],
        performanceMetrics: [
          { metric: 'Forecast Accuracy', value: '92%', description: 'High precision predictions' },
          { metric: 'Processing Speed', value: '10x faster', description: 'Real-time analytics' },
          { metric: 'Data Volume', value: '1M+ records', description: 'Handles big data efficiently' }
        ],
        aiTechnology: {
          approach: 'Machine Learning & Deep Learning',
          model: 'LSTM Neural Networks',
          accuracy: '92% forecast accuracy',
          processingTime: 'Real-time processing, 10x faster than traditional methods'
        },
        useCases: [
          'Perfect for Financial Forecasting',
          'Ideal for Supply Chain Optimization',
          'Optimized for Market Trend Analysis'
        ],
        integrationHighlights: [
          'RESTful API Integration',
          'Works with Tableau, Power BI, Excel',
          'Cloud and On-premise deployment'
        ],
        trustIndicators: [
          'Used by Fortune 500 Companies',
          'ISO 27001 Certified',
          'SOC 2 Compliant'
        ],
        quickBenefits: [
          'Saves 40 hours/week on manual analysis',
          'Increases forecast accuracy by 85%',
          'Reduces decision-making time by 75%'
        ],
        implementationTime: 'Setup in 2-4 weeks, Full training included'
      },
      {
        title: 'Medical Image Analysis',
        slug: 'medical-image-analysis',
        shortDescription: 'Advanced AI for medical imaging with 99% accuracy in diagnosis.',
        description: 'Revolutionary medical imaging AI that assists radiologists in detecting anomalies with 99% accuracy. Supports X-rays, MRIs, CT scans, and ultrasound images with FDA-approved algorithms.',
        category: 'Computer Vision',
        industry: 'Healthcare',
        companyId: createdCompanies[2]._id,
        vendorId: createdUsers[3]._id,
        pricing: {
          model: 'freemium',
          price: { amount: 0, currency: 'USD' },
          customPricing: { available: true, description: 'Enterprise plans available' }
        },
        deployment: {
          type: 'on-premise',
          setupTime: '1-2 weeks',
          integrationComplexity: 'medium'
        },
        features: [
          { title: '99% Accuracy', description: 'FDA-approved algorithms' },
          { title: 'Multi-modal Support', description: 'X-ray, MRI, CT, Ultrasound' },
          { title: 'Real-time Analysis', description: 'Instant diagnosis support' },
          { title: 'HIPAA Compliant', description: 'Secure medical data handling' }
        ],
        tags: ['medical-ai', 'computer-vision', 'healthcare', 'diagnosis'],
        capabilities: ['Image Recognition', 'Anomaly Detection', 'Medical Diagnosis'],
        technologies: ['TensorFlow', 'PyTorch', 'DICOM', 'Python'],
        status: 'approved',
        isActive: true,
        isFeatured: true,
        rating: { average: 4.9, count: 234 },
        views: 3456,
        likes: 167,
        inquiries: 45,
        // Customer-focused metrics
        valuePropositions: [
          'Improves diagnostic accuracy by 25%',
          'Reduces diagnosis time from hours to minutes',
          'Detects anomalies missed by human eyes'
        ],
        performanceMetrics: [
          { metric: 'Diagnostic Accuracy', value: '99%', description: 'FDA-approved algorithms' },
          { metric: 'Processing Time', value: '<30 seconds', description: 'Rapid image analysis' },
          { metric: 'Sensitivity', value: '98.5%', description: 'High anomaly detection rate' }
        ],
        aiTechnology: {
          approach: 'Computer Vision & Deep Learning',
          model: 'Convolutional Neural Networks (CNN)',
          accuracy: '99% diagnostic accuracy, FDA-approved',
          processingTime: '<30 seconds per scan, Real-time analysis'
        },
        useCases: [
          'Perfect for Radiology Departments',
          'Ideal for Emergency Medicine',
          'Optimized for Telemedicine'
        ],
        integrationHighlights: [
          'DICOM Standard Integration',
          'Works with PACS, RIS, EHR systems',
          'HIPAA Compliant deployment'
        ],
        trustIndicators: [
          'FDA Approved Algorithms',
          'HIPAA Compliant',
          'Used by 500+ Hospitals'
        ],
        quickBenefits: [
          'Saves 2 hours/day per radiologist',
          'Increases diagnostic accuracy by 25%',
          'Reduces misdiagnosis by 40%'
        ],
        implementationTime: 'Deploy in 1-2 weeks, HIPAA compliance included'
      },
      {
        title: 'Smart Recommendation Engine',
        slug: 'smart-recommendation-engine',
        shortDescription: 'Personalized product recommendations to boost sales and engagement.',
        description: 'AI-powered recommendation engine that analyzes customer behavior to suggest relevant products. Increases conversion rates by 35% and improves customer satisfaction.',
        category: 'Recommendation Systems',
        industry: 'E-commerce',
        companyId: createdCompanies[3]._id,
        vendorId: createdUsers[1]._id,
        pricing: {
          model: 'free',
          customPricing: { available: true, description: 'Premium features available' }
        },
        deployment: {
          type: 'cloud',
          setupTime: '48 hours',
          integrationComplexity: 'low'
        },
        features: [
          { title: '35% Conversion Boost', description: 'Proven sales increase' },
          { title: 'Real-time Personalization', description: 'Dynamic recommendations' },
          { title: 'A/B Testing', description: 'Optimize recommendation algorithms' },
          { title: 'Analytics Dashboard', description: 'Track performance metrics' }
        ],
        tags: ['recommendation-engine', 'personalization', 'e-commerce', 'machine-learning'],
        capabilities: ['Collaborative Filtering', 'Content-Based Filtering', 'Real-time Processing'],
        technologies: ['Python', 'Apache Kafka', 'Redis', 'Machine Learning'],
        status: 'approved',
        isActive: true,
        isFeatured: false,
        rating: { average: 4.5, count: 67 },
        views: 1234,
        likes: 34,
        inquiries: 12,
        // Customer-focused metrics
        valuePropositions: [
          'Increases conversion rates by 35%',
          'Boosts average order value by 25%',
          'Improves customer engagement by 50%'
        ],
        performanceMetrics: [
          { metric: 'Conversion Rate', value: '+35%', description: 'Proven sales increase' },
          { metric: 'Click-through Rate', value: '+40%', description: 'Higher recommendation engagement' },
          { metric: 'Processing Speed', value: '<100ms', description: 'Real-time recommendations' }
        ],
        aiTechnology: {
          approach: 'Machine Learning & Collaborative Filtering',
          model: 'Matrix Factorization & Deep Learning',
          accuracy: '85% recommendation accuracy',
          processingTime: '<100ms response time, Real-time processing'
        },
        useCases: [
          'Perfect for E-commerce Personalization',
          'Ideal for Content Platforms',
          'Optimized for Retail Analytics'
        ],
        integrationHighlights: [
          'Easy API Integration',
          'Works with Shopify, WooCommerce, Magento',
          'One-Click Setup'
        ],
        trustIndicators: [
          'Used by 1000+ E-commerce Stores',
          'GDPR Compliant',
          '99.9% Uptime SLA'
        ],
        quickBenefits: [
          'Saves 15 hours/week on manual recommendations',
          'Increases revenue by 35%',
          'Reduces cart abandonment by 20%'
        ],
        implementationTime: 'Setup in 48 hours, Free trial available'
      },
      {
        title: 'Automated Document Processing',
        slug: 'automated-document-processing',
        shortDescription: 'AI-powered document extraction and processing for business automation.',
        description: 'Intelligent document processing system that automatically extracts, classifies, and processes documents using OCR and NLP. Reduces manual data entry by 90% and improves accuracy.',
        category: 'Document Processing',
        industry: 'Finance',
        companyId: createdCompanies[1]._id,
        vendorId: createdUsers[2]._id,
        pricing: {
          model: 'subscription',
          price: { amount: 149, currency: 'USD', period: 'monthly' },
          freeTrial: { available: true, duration: '30 days' }
        },
        deployment: {
          type: 'cloud',
          setupTime: '1 week',
          integrationComplexity: 'medium'
        },
        features: [
          { title: 'OCR Technology', description: '99% accurate text extraction' },
          { title: 'Multi-format Support', description: 'PDF, images, scanned documents' },
          { title: 'Auto-classification', description: 'Smart document categorization' },
          { title: 'API Integration', description: 'Seamless workflow integration' }
        ],
        tags: ['document-processing', 'ocr', 'automation', 'nlp'],
        capabilities: ['OCR', 'Document Classification', 'Data Extraction'],
        technologies: ['Python', 'Tesseract', 'OpenCV', 'TensorFlow'],
        status: 'approved',
        isActive: true,
        isFeatured: false,
        rating: { average: 4.7, count: 112 },
        views: 1890,
        likes: 67,
        inquiries: 19,
        valuePropositions: [
          'Reduces manual data entry by 90%',
          'Processes 1000+ documents per hour',
          'Improves accuracy by 95%'
        ],
        performanceMetrics: [
          { metric: 'Processing Speed', value: '1000+ docs/hour', description: 'High throughput' },
          { metric: 'Accuracy Rate', value: '99%', description: 'Near-perfect extraction' },
          { metric: 'Cost Savings', value: '80% reduction', description: 'Significant cost efficiency' }
        ],
        aiTechnology: {
          approach: 'OCR & Natural Language Processing',
          model: 'Custom CNN + NLP Pipeline',
          accuracy: '99% extraction accuracy',
          processingTime: '<2 seconds per document'
        },
        useCases: [
          'Perfect for Invoice Processing',
          'Ideal for Legal Document Management',
          'Optimized for Insurance Claims'
        ],
        integrationHighlights: [
          'REST API Integration',
          'Works with SharePoint, Dropbox, Google Drive',
          'Cloud and On-premise options'
        ],
        trustIndicators: [
          'Used by 500+ Enterprises',
          'SOC 2 Certified',
          'GDPR Compliant'
        ],
        quickBenefits: [
          'Saves 30 hours/week on data entry',
          'Reduces errors by 95%',
          'Increases processing speed by 10x'
        ],
        implementationTime: 'Deploy in 1 week, Full training included'
      },
      {
        title: 'Voice Assistant Platform',
        slug: 'voice-assistant-platform',
        shortDescription: 'Enterprise-grade voice AI for customer interactions and automation.',
        description: 'Advanced voice assistant platform with natural language understanding and multi-language support. Enables voice-activated customer service, appointment scheduling, and information retrieval.',
        category: 'Voice AI',
        industry: 'Customer Service',
        companyId: createdCompanies[0]._id,
        vendorId: createdUsers[1]._id,
        pricing: {
          model: 'subscription',
          price: { amount: 199, currency: 'USD', period: 'monthly' },
          freeTrial: { available: true, duration: '14 days' }
        },
        deployment: {
          type: 'cloud',
          setupTime: '2 weeks',
          integrationComplexity: 'medium'
        },
        features: [
          { title: 'Natural Voice Recognition', description: '95% accuracy in speech-to-text' },
          { title: 'Multi-language', description: 'Supports 30+ languages' },
          { title: 'Custom Voice Training', description: 'Brand-specific voice models' },
          { title: 'Real-time Processing', description: 'Instant response generation' }
        ],
        tags: ['voice-ai', 'speech-recognition', 'customer-service', 'automation'],
        capabilities: ['Speech Recognition', 'Natural Language Understanding', 'Voice Synthesis'],
        technologies: ['Python', 'Google Speech API', 'AWS Polly', 'TensorFlow'],
        status: 'approved',
        isActive: true,
        isFeatured: false,
        rating: { average: 4.6, count: 98 },
        views: 1678,
        likes: 54,
        inquiries: 16,
        valuePropositions: [
          'Handles 500+ calls simultaneously',
          'Reduces call center costs by 60%',
          'Improves customer satisfaction by 45%'
        ],
        performanceMetrics: [
          { metric: 'Response Accuracy', value: '95%', description: 'High understanding rate' },
          { metric: 'Processing Time', value: '<1 second', description: 'Real-time responses' },
          { metric: 'Uptime', value: '99.8%', description: 'Reliable service' }
        ],
        aiTechnology: {
          approach: 'Deep Learning & Speech Recognition',
          model: 'Wav2Vec2 + GPT-4',
          accuracy: '95% speech recognition accuracy',
          processingTime: '<1 second response time'
        },
        useCases: [
          'Perfect for Call Centers',
          'Ideal for Appointment Scheduling',
          'Optimized for Customer Support'
        ],
        integrationHighlights: [
          'Telephony Integration',
          'Works with Twilio, Vonage, RingCentral',
          'CRM Integration Available'
        ],
        trustIndicators: [
          'Used by Fortune 500 Companies',
          'PCI DSS Compliant',
          '99.8% Uptime SLA'
        ],
        quickBenefits: [
          'Saves 25 hours/week on call handling',
          'Reduces call costs by 60%',
          'Increases customer satisfaction by 45%'
        ],
        implementationTime: 'Setup in 2 weeks, Custom voice training included'
      },
      {
        title: 'Fraud Detection System',
        slug: 'fraud-detection-system',
        shortDescription: 'Real-time AI fraud detection for financial transactions and security.',
        description: 'Advanced machine learning system that detects fraudulent transactions in real-time. Uses behavioral analysis and anomaly detection to protect against financial fraud with 99.5% accuracy.',
        category: 'Security AI',
        industry: 'Finance',
        companyId: createdCompanies[1]._id,
        vendorId: createdUsers[2]._id,
        pricing: {
          model: 'contact',
          customPricing: { available: true, description: 'Pricing based on transaction volume' }
        },
        deployment: {
          type: 'hybrid',
          setupTime: '3-4 weeks',
          integrationComplexity: 'high'
        },
        features: [
          { title: 'Real-time Detection', description: 'Instant fraud alerts' },
          { title: '99.5% Accuracy', description: 'Minimal false positives' },
          { title: 'Behavioral Analysis', description: 'User pattern recognition' },
          { title: 'Multi-channel Support', description: 'Cards, online, mobile' }
        ],
        tags: ['fraud-detection', 'security', 'machine-learning', 'finance'],
        capabilities: ['Anomaly Detection', 'Behavioral Analysis', 'Real-time Processing'],
        technologies: ['Python', 'Apache Kafka', 'TensorFlow', 'Redis'],
        status: 'approved',
        isActive: true,
        isFeatured: true,
        rating: { average: 4.8, count: 203 },
        views: 2987,
        likes: 134,
        inquiries: 42,
        valuePropositions: [
          'Prevents 99.5% of fraudulent transactions',
          'Reduces false positives by 80%',
          'Saves millions in fraud losses'
        ],
        performanceMetrics: [
          { metric: 'Detection Accuracy', value: '99.5%', description: 'High precision detection' },
          { metric: 'False Positive Rate', value: '<0.1%', description: 'Minimal false alarms' },
          { metric: 'Processing Speed', value: '<50ms', description: 'Real-time analysis' }
        ],
        aiTechnology: {
          approach: 'Machine Learning & Anomaly Detection',
          model: 'Isolation Forest + Neural Networks',
          accuracy: '99.5% fraud detection accuracy',
          processingTime: '<50ms per transaction'
        },
        useCases: [
          'Perfect for Banking & Finance',
          'Ideal for E-commerce Platforms',
          'Optimized for Payment Processors'
        ],
        integrationHighlights: [
          'API Integration',
          'Works with Stripe, PayPal, Square',
          'Real-time webhook support'
        ],
        trustIndicators: [
          'Used by Top 10 Banks',
          'PCI DSS Level 1 Certified',
          'SOC 2 Type II Compliant'
        ],
        quickBenefits: [
          'Prevents millions in fraud losses',
          'Reduces manual review by 85%',
          'Improves customer trust'
        ],
        implementationTime: 'Deploy in 3-4 weeks, Full compliance included'
      },
      {
        title: 'Content Moderation AI',
        slug: 'content-moderation-ai',
        shortDescription: 'Automated content moderation for social platforms and communities.',
        description: 'AI-powered content moderation system that automatically detects and filters inappropriate content including text, images, and videos. Ensures safe online environments with 98% accuracy.',
        category: 'Content Moderation',
        industry: 'Social Media',
        companyId: createdCompanies[0]._id,
        vendorId: createdUsers[1]._id,
        pricing: {
          model: 'subscription',
          price: { amount: 299, currency: 'USD', period: 'monthly' },
          freeTrial: { available: true, duration: '7 days' }
        },
        deployment: {
          type: 'cloud',
          setupTime: '1 week',
          integrationComplexity: 'low'
        },
        features: [
          { title: 'Multi-modal Detection', description: 'Text, image, video analysis' },
          { title: '98% Accuracy', description: 'High precision moderation' },
          { title: 'Real-time Processing', description: 'Instant content review' },
          { title: 'Custom Rules', description: 'Brand-specific guidelines' }
        ],
        tags: ['content-moderation', 'nlp', 'computer-vision', 'safety'],
        capabilities: ['Text Analysis', 'Image Recognition', 'Video Processing'],
        technologies: ['Python', 'TensorFlow', 'OpenCV', 'BERT'],
        status: 'approved',
        isActive: true,
        isFeatured: false,
        rating: { average: 4.5, count: 87 },
        views: 1456,
        likes: 43,
        inquiries: 14,
        valuePropositions: [
          'Reduces moderation costs by 75%',
          'Processes 10,000+ posts per minute',
          'Improves platform safety'
        ],
        performanceMetrics: [
          { metric: 'Detection Accuracy', value: '98%', description: 'High precision' },
          { metric: 'Processing Speed', value: '10K+ posts/min', description: 'High throughput' },
          { metric: 'False Positive Rate', value: '<2%', description: 'Low false alarms' }
        ],
        aiTechnology: {
          approach: 'Deep Learning & Computer Vision',
          model: 'BERT + CNN + YOLO',
          accuracy: '98% content detection accuracy',
          processingTime: '<100ms per post'
        },
        useCases: [
          'Perfect for Social Media Platforms',
          'Ideal for Online Communities',
          'Optimized for E-commerce Reviews'
        ],
        integrationHighlights: [
          'REST API Integration',
          'Works with WordPress, Discourse, custom platforms',
          'Webhook support for real-time'
        ],
        trustIndicators: [
          'Used by 1000+ Platforms',
          'GDPR Compliant',
          '99.9% Uptime'
        ],
        quickBenefits: [
          'Saves 40 hours/week on moderation',
          'Reduces moderation costs by 75%',
          'Improves user safety'
        ],
        implementationTime: 'Setup in 1 week, Custom rules configuration included'
      },
      {
        title: 'Supply Chain Optimization',
        slug: 'supply-chain-optimization',
        shortDescription: 'AI-driven supply chain management and inventory optimization.',
        description: 'Intelligent supply chain platform that optimizes inventory levels, predicts demand, and automates procurement. Reduces inventory costs by 30% and improves delivery times.',
        category: 'Supply Chain',
        industry: 'Manufacturing',
        companyId: createdCompanies[1]._id,
        vendorId: createdUsers[2]._id,
        pricing: {
          model: 'subscription',
          price: { amount: 399, currency: 'USD', period: 'monthly' },
          freeTrial: { available: true, duration: '30 days' }
        },
        deployment: {
          type: 'hybrid',
          setupTime: '4-6 weeks',
          integrationComplexity: 'high'
        },
        features: [
          { title: 'Demand Forecasting', description: '90% accurate predictions' },
          { title: 'Inventory Optimization', description: 'Reduces stockouts by 80%' },
          { title: 'Automated Procurement', description: 'Smart reorder points' },
          { title: 'Real-time Analytics', description: 'Live supply chain insights' }
        ],
        tags: ['supply-chain', 'inventory', 'forecasting', 'optimization'],
        capabilities: ['Demand Forecasting', 'Inventory Optimization', 'Procurement Automation'],
        technologies: ['Python', 'Apache Spark', 'TensorFlow', 'PostgreSQL'],
        status: 'approved',
        isActive: true,
        isFeatured: false,
        rating: { average: 4.7, count: 145 },
        views: 2234,
        likes: 89,
        inquiries: 28,
        valuePropositions: [
          'Reduces inventory costs by 30%',
          'Improves delivery times by 25%',
          'Eliminates stockouts by 80%'
        ],
        performanceMetrics: [
          { metric: 'Forecast Accuracy', value: '90%', description: 'Reliable predictions' },
          { metric: 'Cost Reduction', value: '30%', description: 'Significant savings' },
          { metric: 'Stockout Reduction', value: '80%', description: 'Better availability' }
        ],
        aiTechnology: {
          approach: 'Machine Learning & Time Series Analysis',
          model: 'LSTM + ARIMA Models',
          accuracy: '90% demand forecast accuracy',
          processingTime: 'Real-time optimization'
        },
        useCases: [
          'Perfect for Manufacturing',
          'Ideal for Retail Chains',
          'Optimized for Distribution Centers'
        ],
        integrationHighlights: [
          'ERP Integration',
          'Works with SAP, Oracle, Microsoft Dynamics',
          'API and EDI support'
        ],
        trustIndicators: [
          'Used by Fortune 500 Companies',
          'ISO 27001 Certified',
          '99.9% Uptime SLA'
        ],
        quickBenefits: [
          'Saves $100K+ annually on inventory',
          'Reduces stockouts by 80%',
          'Improves delivery performance'
        ],
        implementationTime: 'Deploy in 4-6 weeks, Full ERP integration included'
      },
      {
        title: 'Sentiment Analysis Platform',
        slug: 'sentiment-analysis-platform',
        shortDescription: 'Real-time sentiment analysis for social media and customer feedback.',
        description: 'Advanced sentiment analysis platform that monitors brand reputation across social media, reviews, and customer feedback. Provides real-time insights and alerts for negative sentiment.',
        category: 'Analytics',
        industry: 'Marketing',
        companyId: createdCompanies[0]._id,
        vendorId: createdUsers[1]._id,
        pricing: {
          model: 'subscription',
          price: { amount: 129, currency: 'USD', period: 'monthly' },
          freeTrial: { available: true, duration: '14 days' }
        },
        deployment: {
          type: 'cloud',
          setupTime: '3 days',
          integrationComplexity: 'low'
        },
        features: [
          { title: 'Real-time Monitoring', description: '24/7 sentiment tracking' },
          { title: 'Multi-channel', description: 'Social, reviews, surveys' },
          { title: 'Emotion Detection', description: 'Identifies 8+ emotions' },
          { title: 'Alert System', description: 'Instant negative sentiment alerts' }
        ],
        tags: ['sentiment-analysis', 'social-media', 'analytics', 'nlp'],
        capabilities: ['Sentiment Analysis', 'Emotion Detection', 'Real-time Monitoring'],
        technologies: ['Python', 'BERT', 'Twitter API', 'Reddit API'],
        status: 'approved',
        isActive: true,
        isFeatured: false,
        rating: { average: 4.4, count: 76 },
        views: 1234,
        likes: 38,
        inquiries: 11,
        valuePropositions: [
          'Monitors 1M+ mentions daily',
          'Identifies issues 10x faster',
          'Improves brand reputation'
        ],
        performanceMetrics: [
          { metric: 'Accuracy', value: '92%', description: 'High precision analysis' },
          { metric: 'Processing Volume', value: '1M+ mentions/day', description: 'High throughput' },
          { metric: 'Response Time', value: '<5 seconds', description: 'Real-time alerts' }
        ],
        aiTechnology: {
          approach: 'Natural Language Processing & Deep Learning',
          model: 'BERT + RoBERTa',
          accuracy: '92% sentiment accuracy',
          processingTime: '<5 seconds per analysis'
        },
        useCases: [
          'Perfect for Brand Monitoring',
          'Ideal for Customer Service',
          'Optimized for Marketing Teams'
        ],
        integrationHighlights: [
          'Social Media APIs',
          'Works with Hootsuite, Sprout Social',
          'Webhook integrations'
        ],
        trustIndicators: [
          'Used by 500+ Brands',
          'GDPR Compliant',
          '99.9% Uptime'
        ],
        quickBenefits: [
          'Identifies issues 10x faster',
          'Improves response time by 60%',
          'Protects brand reputation'
        ],
        implementationTime: 'Setup in 3 days, Free trial available'
      },
      {
        title: 'Email Automation AI',
        slug: 'email-automation-ai',
        shortDescription: 'Intelligent email automation with personalization and optimization.',
        description: 'AI-powered email marketing platform that personalizes content, optimizes send times, and automates campaigns. Increases open rates by 40% and click-through rates by 35%.',
        category: 'Marketing AI',
        industry: 'Marketing',
        companyId: createdCompanies[3]._id,
        vendorId: createdUsers[1]._id,
        pricing: {
          model: 'subscription',
          price: { amount: 79, currency: 'USD', period: 'monthly' },
          freeTrial: { available: true, duration: '14 days' }
        },
        deployment: {
          type: 'cloud',
          setupTime: '2 days',
          integrationComplexity: 'low'
        },
        features: [
          { title: 'Smart Personalization', description: 'AI-generated content' },
          { title: 'Send Time Optimization', description: 'Best time prediction' },
          { title: 'A/B Testing', description: 'Automated campaign testing' },
          { title: 'Analytics Dashboard', description: 'Performance insights' }
        ],
        tags: ['email-marketing', 'automation', 'personalization', 'marketing'],
        capabilities: ['Content Personalization', 'Send Time Optimization', 'Campaign Automation'],
        technologies: ['Python', 'Machine Learning', 'SendGrid', 'Mailchimp API'],
        status: 'approved',
        isActive: true,
        isFeatured: false,
        rating: { average: 4.6, count: 134 },
        views: 1987,
        likes: 72,
        inquiries: 22,
        valuePropositions: [
          'Increases open rates by 40%',
          'Boosts click-through by 35%',
          'Reduces unsubscribes by 50%'
        ],
        performanceMetrics: [
          { metric: 'Open Rate Increase', value: '+40%', description: 'Better engagement' },
          { metric: 'CTR Improvement', value: '+35%', description: 'Higher clicks' },
          { metric: 'Unsubscribe Reduction', value: '-50%', description: 'Better retention' }
        ],
        aiTechnology: {
          approach: 'Machine Learning & Natural Language Generation',
          model: 'GPT-4 + Time Series Models',
          accuracy: '85% send time prediction accuracy',
          processingTime: 'Real-time personalization'
        },
        useCases: [
          'Perfect for E-commerce Marketing',
          'Ideal for SaaS Companies',
          'Optimized for Newsletters'
        ],
        integrationHighlights: [
          'Email Service Integration',
          'Works with Mailchimp, SendGrid, AWS SES',
          'CRM Integration Available'
        ],
        trustIndicators: [
          'Used by 2000+ Companies',
          'GDPR Compliant',
          '99.9% Delivery Rate'
        ],
        quickBenefits: [
          'Increases revenue by 25%',
          'Saves 20 hours/week on campaigns',
          'Improves customer engagement'
        ],
        implementationTime: 'Setup in 2 days, Free trial available'
      },
      {
        title: 'HR Recruitment AI',
        slug: 'hr-recruitment-ai',
        shortDescription: 'AI-powered recruitment platform for candidate screening and matching.',
        description: 'Intelligent recruitment system that screens resumes, matches candidates to jobs, and automates interview scheduling. Reduces time-to-hire by 50% and improves candidate quality.',
        category: 'HR Tech',
        industry: 'Human Resources',
        companyId: createdCompanies[0]._id,
        vendorId: createdUsers[1]._id,
        pricing: {
          model: 'subscription',
          price: { amount: 249, currency: 'USD', period: 'monthly' },
          freeTrial: { available: true, duration: '14 days' }
        },
        deployment: {
          type: 'cloud',
          setupTime: '1 week',
          integrationComplexity: 'medium'
        },
        features: [
          { title: 'Resume Screening', description: 'Automated candidate evaluation' },
          { title: 'Job Matching', description: '95% match accuracy' },
          { title: 'Interview Scheduling', description: 'Automated calendar coordination' },
          { title: 'Candidate Ranking', description: 'AI-powered scoring' }
        ],
        tags: ['recruitment', 'hr-tech', 'automation', 'nlp'],
        capabilities: ['Resume Analysis', 'Job Matching', 'Interview Automation'],
        technologies: ['Python', 'NLP', 'Machine Learning', 'Calendar APIs'],
        status: 'approved',
        isActive: true,
        isFeatured: false,
        rating: { average: 4.5, count: 98 },
        views: 1678,
        likes: 56,
        inquiries: 17,
        valuePropositions: [
          'Reduces time-to-hire by 50%',
          'Improves candidate quality by 30%',
          'Saves 20 hours/week on screening'
        ],
        performanceMetrics: [
          { metric: 'Match Accuracy', value: '95%', description: 'High precision matching' },
          { metric: 'Time Reduction', value: '50%', description: 'Faster hiring' },
          { metric: 'Quality Improvement', value: '30%', description: 'Better candidates' }
        ],
        aiTechnology: {
          approach: 'Natural Language Processing & Machine Learning',
          model: 'BERT + Custom Matching Algorithm',
          accuracy: '95% job match accuracy',
          processingTime: '<10 seconds per resume'
        },
        useCases: [
          'Perfect for HR Departments',
          'Ideal for Recruitment Agencies',
          'Optimized for Tech Hiring'
        ],
        integrationHighlights: [
          'ATS Integration',
          'Works with Greenhouse, Lever, Workday',
          'Calendar and Email sync'
        ],
        trustIndicators: [
          'Used by 1000+ Companies',
          'EEOC Compliant',
          'GDPR Compliant'
        ],
        quickBenefits: [
          'Saves 20 hours/week on screening',
          'Reduces hiring costs by 40%',
          'Improves candidate experience'
        ],
        implementationTime: 'Setup in 1 week, ATS integration included'
      },
      {
        title: 'Energy Consumption Optimizer',
        slug: 'energy-consumption-optimizer',
        shortDescription: 'AI-driven energy management for buildings and facilities.',
        description: 'Smart energy management system that optimizes HVAC, lighting, and equipment usage using AI. Reduces energy costs by 25% and carbon footprint by 30%.',
        category: 'Energy AI',
        industry: 'Real Estate',
        companyId: createdCompanies[1]._id,
        vendorId: createdUsers[2]._id,
        pricing: {
          model: 'subscription',
          price: { amount: 199, currency: 'USD', period: 'monthly' },
          freeTrial: { available: true, duration: '30 days' }
        },
        deployment: {
          type: 'hybrid',
          setupTime: '2-3 weeks',
          integrationComplexity: 'medium'
        },
        features: [
          { title: 'Smart HVAC Control', description: 'Automated temperature optimization' },
          { title: 'Lighting Optimization', description: 'Intelligent lighting schedules' },
          { title: 'Energy Forecasting', description: 'Predictive consumption models' },
          { title: 'Cost Analytics', description: 'Real-time cost tracking' }
        ],
        tags: ['energy', 'iot', 'sustainability', 'optimization'],
        capabilities: ['Energy Optimization', 'Predictive Analytics', 'IoT Integration'],
        technologies: ['Python', 'IoT Sensors', 'Machine Learning', 'Cloud Platform'],
        status: 'approved',
        isActive: true,
        isFeatured: false,
        rating: { average: 4.6, count: 112 },
        views: 1789,
        likes: 64,
        inquiries: 20,
        valuePropositions: [
          'Reduces energy costs by 25%',
          'Lowers carbon footprint by 30%',
          'Pays for itself in 8 months'
        ],
        performanceMetrics: [
          { metric: 'Cost Reduction', value: '25%', description: 'Significant savings' },
          { metric: 'Carbon Reduction', value: '30%', description: 'Environmental impact' },
          { metric: 'ROI', value: '8 months', description: 'Quick payback' }
        ],
        aiTechnology: {
          approach: 'Machine Learning & IoT Analytics',
          model: 'Time Series Forecasting + Optimization',
          accuracy: '90% consumption prediction',
          processingTime: 'Real-time optimization'
        },
        useCases: [
          'Perfect for Office Buildings',
          'Ideal for Manufacturing Facilities',
          'Optimized for Retail Stores'
        ],
        integrationHighlights: [
          'Building Management Systems',
          'Works with Honeywell, Johnson Controls',
          'IoT sensor integration'
        ],
        trustIndicators: [
          'Used by 500+ Buildings',
          'LEED Certified',
          'Energy Star Partner'
        ],
        quickBenefits: [
          'Saves $50K+ annually on energy',
          'Reduces carbon footprint',
          'Improves sustainability score'
        ],
        implementationTime: 'Deploy in 2-3 weeks, Full IoT setup included'
      },
      {
        title: 'Legal Document Analyzer',
        slug: 'legal-document-analyzer',
        shortDescription: 'AI-powered legal document analysis and contract review.',
        description: 'Intelligent legal document analysis platform that reviews contracts, identifies risks, and extracts key terms. Reduces review time by 80% and improves accuracy.',
        category: 'Legal Tech',
        industry: 'Legal',
        companyId: createdCompanies[2]._id,
        vendorId: createdUsers[3]._id,
        pricing: {
          model: 'subscription',
          price: { amount: 349, currency: 'USD', period: 'monthly' },
          freeTrial: { available: true, duration: '7 days' }
        },
        deployment: {
          type: 'cloud',
          setupTime: '1 week',
          integrationComplexity: 'medium'
        },
        features: [
          { title: 'Contract Review', description: 'Automated risk identification' },
          { title: 'Term Extraction', description: 'Key clause identification' },
          { title: 'Compliance Checking', description: 'Regulatory compliance verification' },
          { title: 'Document Comparison', description: 'Version diff analysis' }
        ],
        tags: ['legal-tech', 'document-analysis', 'nlp', 'compliance'],
        capabilities: ['Document Analysis', 'Risk Identification', 'Compliance Checking'],
        technologies: ['Python', 'BERT', 'Legal NLP', 'Document Processing'],
        status: 'approved',
        isActive: true,
        isFeatured: false,
        rating: { average: 4.7, count: 156 },
        views: 2341,
        likes: 98,
        inquiries: 31,
        valuePropositions: [
          'Reduces review time by 80%',
          'Identifies 95% of risks',
          'Improves contract quality'
        ],
        performanceMetrics: [
          { metric: 'Time Reduction', value: '80%', description: 'Faster reviews' },
          { metric: 'Risk Detection', value: '95%', description: 'High accuracy' },
          { metric: 'Processing Speed', value: '<5 min', description: 'Quick analysis' }
        ],
        aiTechnology: {
          approach: 'Natural Language Processing & Legal AI',
          model: 'Legal-BERT + Custom Models',
          accuracy: '95% risk detection accuracy',
          processingTime: '<5 minutes per contract'
        },
        useCases: [
          'Perfect for Law Firms',
          'Ideal for Corporate Legal Teams',
          'Optimized for Contract Management'
        ],
        integrationHighlights: [
          'Document Management Systems',
          'Works with DocuSign, Clio, LegalZoom',
          'API integration available'
        ],
        trustIndicators: [
          'Used by 500+ Law Firms',
          'SOC 2 Certified',
          'Attorney-Client Privilege Protected'
        ],
        quickBenefits: [
          'Saves 30 hours/week on reviews',
          'Reduces legal risks',
          'Improves contract quality'
        ],
        implementationTime: 'Setup in 1 week, Legal training included'
      },
      {
        title: 'Quality Control AI',
        slug: 'quality-control-ai',
        shortDescription: 'Computer vision-based quality inspection for manufacturing.',
        description: 'AI-powered quality control system that automatically inspects products using computer vision. Detects defects with 99% accuracy and reduces inspection time by 90%.',
        category: 'Computer Vision',
        industry: 'Manufacturing',
        companyId: createdCompanies[2]._id,
        vendorId: createdUsers[3]._id,
        pricing: {
          model: 'contact',
          customPricing: { available: true, description: 'Pricing based on production volume' }
        },
        deployment: {
          type: 'on-premise',
          setupTime: '3-4 weeks',
          integrationComplexity: 'high'
        },
        features: [
          { title: 'Defect Detection', description: '99% accuracy in identifying flaws' },
          { title: 'Real-time Inspection', description: 'Instant quality assessment' },
          { title: 'Multi-product Support', description: 'Handles various product types' },
          { title: 'Analytics Dashboard', description: 'Quality metrics and trends' }
        ],
        tags: ['quality-control', 'computer-vision', 'manufacturing', 'inspection'],
        capabilities: ['Defect Detection', 'Image Analysis', 'Real-time Processing'],
        technologies: ['Python', 'OpenCV', 'TensorFlow', 'Industrial Cameras'],
        status: 'approved',
        isActive: true,
        isFeatured: true,
        rating: { average: 4.8, count: 189 },
        views: 2876,
        likes: 145,
        inquiries: 38,
        valuePropositions: [
          'Reduces inspection time by 90%',
          'Improves quality by 25%',
          'Eliminates human error'
        ],
        performanceMetrics: [
          { metric: 'Detection Accuracy', value: '99%', description: 'Near-perfect detection' },
          { metric: 'Time Reduction', value: '90%', description: 'Much faster' },
          { metric: 'False Positive Rate', value: '<1%', description: 'Minimal errors' }
        ],
        aiTechnology: {
          approach: 'Computer Vision & Deep Learning',
          model: 'YOLO + Custom CNN',
          accuracy: '99% defect detection accuracy',
          processingTime: '<100ms per product'
        },
        useCases: [
          'Perfect for Manufacturing Lines',
          'Ideal for Food Processing',
          'Optimized for Electronics Assembly'
        ],
        integrationHighlights: [
          'Production Line Integration',
          'Works with PLC systems, MES',
          'Industrial camera support'
        ],
        trustIndicators: [
          'Used by Top Manufacturers',
          'ISO 9001 Certified',
          '99.9% Uptime'
        ],
        quickBenefits: [
          'Saves $200K+ annually on quality',
          'Reduces defects by 25%',
          'Improves production efficiency'
        ],
        implementationTime: 'Deploy in 3-4 weeks, Full production line integration'
      },
      {
        title: 'Price Optimization Engine',
        slug: 'price-optimization-engine',
        shortDescription: 'Dynamic pricing AI for e-commerce and retail optimization.',
        description: 'Intelligent pricing platform that optimizes product prices in real-time based on demand, competition, and market conditions. Increases revenue by 15% and profit margins by 20%.',
        category: 'Pricing AI',
        industry: 'E-commerce',
        companyId: createdCompanies[3]._id,
        vendorId: createdUsers[1]._id,
        pricing: {
          model: 'subscription',
          price: { amount: 179, currency: 'USD', period: 'monthly' },
          freeTrial: { available: true, duration: '14 days' }
        },
        deployment: {
          type: 'cloud',
          setupTime: '1 week',
          integrationComplexity: 'low'
        },
        features: [
          { title: 'Dynamic Pricing', description: 'Real-time price adjustments' },
          { title: 'Competitor Monitoring', description: 'Automatic price tracking' },
          { title: 'Demand Forecasting', description: 'Predictive pricing models' },
          { title: 'A/B Testing', description: 'Price optimization experiments' }
        ],
        tags: ['pricing', 'e-commerce', 'optimization', 'revenue'],
        capabilities: ['Dynamic Pricing', 'Demand Forecasting', 'Competitor Analysis'],
        technologies: ['Python', 'Machine Learning', 'APIs', 'Real-time Processing'],
        status: 'approved',
        isActive: true,
        isFeatured: false,
        rating: { average: 4.6, count: 123 },
        views: 1890,
        likes: 71,
        inquiries: 24,
        valuePropositions: [
          'Increases revenue by 15%',
          'Boosts profit margins by 20%',
          'Optimizes prices automatically'
        ],
        performanceMetrics: [
          { metric: 'Revenue Increase', value: '+15%', description: 'Higher sales' },
          { metric: 'Margin Improvement', value: '+20%', description: 'Better profits' },
          { metric: 'Optimization Speed', value: 'Real-time', description: 'Instant updates' }
        ],
        aiTechnology: {
          approach: 'Machine Learning & Optimization Algorithms',
          model: 'Reinforcement Learning + Time Series',
          accuracy: '90% price optimization accuracy',
          processingTime: 'Real-time price updates'
        },
        useCases: [
          'Perfect for E-commerce',
          'Ideal for Retail Chains',
          'Optimized for Marketplaces'
        ],
        integrationHighlights: [
          'E-commerce Platform Integration',
          'Works with Shopify, WooCommerce, Magento',
          'API and webhook support'
        ],
        trustIndicators: [
          'Used by 2000+ Stores',
          'GDPR Compliant',
          '99.9% Uptime'
        ],
        quickBenefits: [
          'Increases revenue by 15%',
          'Saves 10 hours/week on pricing',
          'Maximizes profit margins'
        ],
        implementationTime: 'Setup in 1 week, Free trial available'
      },
      {
        title: 'Customer Churn Predictor',
        slug: 'customer-churn-predictor',
        shortDescription: 'AI-powered customer retention and churn prediction system.',
        description: 'Advanced machine learning platform that predicts customer churn and identifies at-risk customers. Enables proactive retention strategies and reduces churn by 35%.',
        category: 'Analytics',
        industry: 'SaaS',
        companyId: createdCompanies[1]._id,
        vendorId: createdUsers[2]._id,
        pricing: {
          model: 'subscription',
          price: { amount: 149, currency: 'USD', period: 'monthly' },
          freeTrial: { available: true, duration: '14 days' }
        },
        deployment: {
          type: 'cloud',
          setupTime: '1 week',
          integrationComplexity: 'medium'
        },
        features: [
          { title: 'Churn Prediction', description: '90% accurate risk scoring' },
          { title: 'Risk Segmentation', description: 'Customer risk categorization' },
          { title: 'Retention Campaigns', description: 'Automated intervention triggers' },
          { title: 'Analytics Dashboard', description: 'Churn insights and trends' }
        ],
        tags: ['churn-prediction', 'analytics', 'retention', 'saas'],
        capabilities: ['Churn Prediction', 'Risk Scoring', 'Retention Automation'],
        technologies: ['Python', 'Machine Learning', 'TensorFlow', 'CRM Integration'],
        status: 'approved',
        isActive: true,
        isFeatured: false,
        rating: { average: 4.5, count: 98 },
        views: 1567,
        likes: 52,
        inquiries: 16,
        valuePropositions: [
          'Reduces churn by 35%',
          'Increases customer lifetime value by 25%',
          'Identifies at-risk customers early'
        ],
        performanceMetrics: [
          { metric: 'Prediction Accuracy', value: '90%', description: 'High precision' },
          { metric: 'Churn Reduction', value: '35%', description: 'Better retention' },
          { metric: 'Early Detection', value: '30 days', description: 'Proactive alerts' }
        ],
        aiTechnology: {
          approach: 'Machine Learning & Predictive Analytics',
          model: 'XGBoost + Neural Networks',
          accuracy: '90% churn prediction accuracy',
          processingTime: 'Daily batch + real-time updates'
        },
        useCases: [
          'Perfect for SaaS Companies',
          'Ideal for Subscription Services',
          'Optimized for E-commerce'
        ],
        integrationHighlights: [
          'CRM Integration',
          'Works with Salesforce, HubSpot, Zendesk',
          'Webhook and API support'
        ],
        trustIndicators: [
          'Used by 1000+ Companies',
          'SOC 2 Certified',
          'GDPR Compliant'
        ],
        quickBenefits: [
          'Saves $100K+ annually on retention',
          'Reduces churn by 35%',
          'Improves customer lifetime value'
        ],
        implementationTime: 'Setup in 1 week, CRM integration included'
      },
      {
        title: 'Video Content Analyzer',
        slug: 'video-content-analyzer',
        shortDescription: 'AI-powered video analysis for content moderation and insights.',
        description: 'Intelligent video analysis platform that automatically detects objects, scenes, and inappropriate content in videos. Processes videos 100x faster than manual review.',
        category: 'Video AI',
        industry: 'Media',
        companyId: createdCompanies[0]._id,
        vendorId: createdUsers[1]._id,
        pricing: {
          model: 'subscription',
          price: { amount: 249, currency: 'USD', period: 'monthly' },
          freeTrial: { available: true, duration: '7 days' }
        },
        deployment: {
          type: 'cloud',
          setupTime: '1 week',
          integrationComplexity: 'medium'
        },
        features: [
          { title: 'Object Detection', description: 'Identifies objects and scenes' },
          { title: 'Content Moderation', description: 'Detects inappropriate content' },
          { title: 'Video Summarization', description: 'Auto-generates video summaries' },
          { title: 'Metadata Extraction', description: 'Tags and categorizes videos' }
        ],
        tags: ['video-ai', 'computer-vision', 'content-moderation', 'media'],
        capabilities: ['Object Detection', 'Content Moderation', 'Video Analysis'],
        technologies: ['Python', 'OpenCV', 'TensorFlow', 'FFmpeg'],
        status: 'approved',
        isActive: true,
        isFeatured: false,
        rating: { average: 4.4, count: 87 },
        views: 1345,
        likes: 41,
        inquiries: 13,
        valuePropositions: [
          'Processes videos 100x faster',
          'Reduces moderation costs by 80%',
          'Improves content quality'
        ],
        performanceMetrics: [
          { metric: 'Processing Speed', value: '100x faster', description: 'Much faster than manual' },
          { metric: 'Detection Accuracy', value: '95%', description: 'High precision' },
          { metric: 'Cost Reduction', value: '80%', description: 'Significant savings' }
        ],
        aiTechnology: {
          approach: 'Computer Vision & Deep Learning',
          model: '3D CNN + YOLO',
          accuracy: '95% content detection accuracy',
          processingTime: '<1 minute per video'
        },
        useCases: [
          'Perfect for Video Platforms',
          'Ideal for Content Creators',
          'Optimized for Media Companies'
        ],
        integrationHighlights: [
          'Video Platform Integration',
          'Works with YouTube, Vimeo, custom platforms',
          'API and webhook support'
        ],
        trustIndicators: [
          'Used by 500+ Platforms',
          'GDPR Compliant',
          '99.9% Uptime'
        ],
        quickBenefits: [
          'Saves 40 hours/week on moderation',
          'Reduces costs by 80%',
          'Improves content safety'
        ],
        implementationTime: 'Setup in 1 week, Platform integration included'
      },
      {
        title: 'Route Optimization AI',
        slug: 'route-optimization-ai',
        shortDescription: 'AI-driven route planning and delivery optimization.',
        description: 'Intelligent route optimization system that plans efficient delivery routes, reduces fuel costs, and improves delivery times. Reduces delivery costs by 30% and improves on-time delivery by 25%.',
        category: 'Logistics',
        industry: 'Transportation',
        companyId: createdCompanies[1]._id,
        vendorId: createdUsers[2]._id,
        pricing: {
          model: 'subscription',
          price: { amount: 199, currency: 'USD', period: 'monthly' },
          freeTrial: { available: true, duration: '14 days' }
        },
        deployment: {
          type: 'cloud',
          setupTime: '1 week',
          integrationComplexity: 'medium'
        },
        features: [
          { title: 'Route Planning', description: 'Optimal route calculation' },
          { title: 'Traffic Analysis', description: 'Real-time traffic integration' },
          { title: 'Multi-stop Optimization', description: 'Efficient delivery sequencing' },
          { title: 'Driver Analytics', description: 'Performance tracking' }
        ],
        tags: ['logistics', 'route-optimization', 'delivery', 'transportation'],
        capabilities: ['Route Optimization', 'Traffic Analysis', 'Delivery Planning'],
        technologies: ['Python', 'Google Maps API', 'Machine Learning', 'Optimization Algorithms'],
        status: 'approved',
        isActive: true,
        isFeatured: false,
        rating: { average: 4.6, count: 134 },
        views: 1987,
        likes: 78,
        inquiries: 26,
        valuePropositions: [
          'Reduces delivery costs by 30%',
          'Improves on-time delivery by 25%',
          'Saves fuel and time'
        ],
        performanceMetrics: [
          { metric: 'Cost Reduction', value: '30%', description: 'Lower delivery costs' },
          { metric: 'On-time Improvement', value: '+25%', description: 'Better delivery' },
          { metric: 'Fuel Savings', value: '20%', description: 'Efficiency gains' }
        ],
        aiTechnology: {
          approach: 'Machine Learning & Optimization Algorithms',
          model: 'Genetic Algorithms + ML',
          accuracy: '95% route optimization',
          processingTime: '<30 seconds per route'
        },
        useCases: [
          'Perfect for Delivery Services',
          'Ideal for Field Service',
          'Optimized for Logistics Companies'
        ],
        integrationHighlights: [
          'Fleet Management Systems',
          'Works with Samsara, Geotab, custom systems',
          'GPS and telematics integration'
        ],
        trustIndicators: [
          'Used by 1000+ Fleets',
          '99.9% Uptime',
          'Real-time Updates'
        ],
        quickBenefits: [
          'Saves $50K+ annually on delivery',
          'Reduces fuel costs by 20%',
          'Improves customer satisfaction'
        ],
        implementationTime: 'Setup in 1 week, Fleet integration included'
      }
    ];

    const createdSolutions = await Solution.insertMany(solutions);
    console.log(`✅ Created ${createdSolutions.length} solutions`);

    // Create sample queries
    const queries = [
      {
        title: 'Need AI solution for customer support automation',
        description: 'Looking for an AI chatbot that can handle customer inquiries 24/7. Should integrate with our existing CRM and support multiple languages. Budget: $5000-10000/month.',
        customerId: createdUsers[4]._id,
        category: 'Chatbots',
        industry: 'Healthcare',
        tags: ['customer-service', 'automation', '24-7'],
        requirements: {
          budget: { min: 5000, max: 10000, currency: 'USD' },
          timeline: '1-month',
          companySize: 'medium',
          deployment: 'cloud'
        },
        status: 'active',
        isPublic: true,
        contactPreference: 'email'
      },
      {
        title: 'Looking for predictive analytics for inventory management',
        description: 'Need a solution to predict inventory demand and optimize stock levels. Should work with our existing ERP system and provide real-time insights.',
        customerId: createdUsers[5]._id,
        category: 'Predictive Analytics',
        industry: 'E-commerce',
        tags: ['inventory', 'forecasting', 'erp-integration'],
        requirements: {
          budget: { min: 2000, max: 8000, currency: 'USD' },
          timeline: '3-months',
          companySize: 'enterprise',
          deployment: 'hybrid'
        },
        status: 'active',
        isPublic: true,
        contactPreference: 'meeting'
      }
    ];

    const createdQueries = await Query.insertMany(queries);
    console.log(`✅ Created ${createdQueries.length} queries`);

    // Create sample reviews
    const reviews = [
      {
        title: 'Excellent customer service automation',
        content: 'The AI chatbot has transformed our customer support. Response time improved by 80% and customer satisfaction increased significantly. Easy to set up and customize.',
        solutionId: createdSolutions[0]._id,
        companyId: createdCompanies[0]._id,
        customerId: createdUsers[4]._id,
        customerName: 'Emily Davis',
        customerCompany: 'HealthCorp',
        customerRole: 'CTO',
        rating: {
          overall: 5,
          features: 5,
          easeOfUse: 4,
          valueForMoney: 5,
          customerSupport: 5
        },
        status: 'approved',
        isVerified: true,
        implementation: {
          duration: '3 months',
          companySize: 'medium',
          useCase: 'Customer Support',
          challenges: ['Integration complexity'],
          benefits: ['Faster response times', 'Cost reduction', 'Better customer satisfaction']
        }
      },
      {
        title: 'Powerful analytics platform',
        content: 'Great predictive analytics tool. The forecasting accuracy is impressive and the dashboard is intuitive. Setup took some time but worth it.',
        solutionId: createdSolutions[1]._id,
        companyId: createdCompanies[1]._id,
        customerId: createdUsers[5]._id,
        customerName: 'David Wilson',
        customerCompany: 'MegaRetail',
        customerRole: 'VP Technology',
        rating: {
          overall: 4,
          features: 5,
          easeOfUse: 3,
          valueForMoney: 4,
          customerSupport: 4
        },
        status: 'approved',
        isVerified: true,
        implementation: {
          duration: '6 months',
          companySize: 'large',
          useCase: 'Inventory Management',
          challenges: ['Data integration', 'Learning curve'],
          benefits: ['Better forecasting', 'Reduced waste', 'Improved efficiency']
        }
      }
    ];

    const createdReviews = await Review.insertMany(reviews);
    console.log(`✅ Created ${createdReviews.length} reviews`);

    // Create sample blogs
    const blogs = [
      {
        title: 'The Future of AI in Healthcare: Trends and Opportunities',
        slug: 'future-of-ai-in-healthcare-trends-and-opportunities',
        excerpt: 'Explore how artificial intelligence is revolutionizing healthcare delivery, from diagnosis to treatment optimization.',
        content: 'Artificial intelligence is transforming healthcare at an unprecedented pace. From diagnostic imaging to drug discovery, AI is enabling healthcare professionals to provide better care, faster diagnoses, and more personalized treatments. In this comprehensive guide, we explore the latest trends and opportunities in healthcare AI, including machine learning applications, computer vision in medical imaging, and predictive analytics for patient care.',
        authorId: createdUsers[0]._id,
        authorName: 'Dr. Sarah Johnson',
        category: 'Healthcare AI',
        industry: 'Healthcare',
        tags: ['healthcare', 'ai-trends', 'medical-ai', 'innovation'],
        status: 'published',
        isFeatured: true,
        publishedAt: new Date(),
        readTime: 8,
        views: 1250,
        likes: 45
      },
      {
        title: 'Building Effective AI Chatbots: Best Practices and Common Pitfalls',
        slug: 'building-effective-ai-chatbots-best-practices-and-common-pitfalls',
        excerpt: 'Learn the essential strategies for creating AI chatbots that actually work and deliver value to your business.',
        content: 'Creating an effective AI chatbot requires careful planning and execution. From natural language processing to conversation design, there are many factors that contribute to a successful chatbot implementation. This guide covers the best practices for building chatbots, common pitfalls to avoid, and how to measure success.',
        authorId: createdUsers[1]._id,
        authorName: 'John Smith',
        category: 'AI Chatbots',
        industry: 'Technology',
        tags: ['chatbots', 'best-practices', 'customer-service', 'automation'],
        status: 'published',
        isFeatured: true,
        publishedAt: new Date(Date.now() - 86400000), // 1 day ago
        readTime: 6,
        views: 890,
        likes: 32
      },
      {
        title: 'Machine Learning in Finance: Risk Assessment and Fraud Detection',
        slug: 'machine-learning-finance-risk-assessment-fraud-detection',
        excerpt: 'Discover how financial institutions are leveraging ML to improve risk management and detect fraudulent activities.',
        content: 'The financial industry has been at the forefront of adopting machine learning technologies. From credit scoring to algorithmic trading, ML is revolutionizing how financial institutions operate. This article explores the latest applications of machine learning in finance, including risk assessment models, fraud detection systems, and automated trading algorithms.',
        authorId: createdUsers[2]._id,
        authorName: 'Michael Chen',
        category: 'Machine Learning',
        industry: 'Finance',
        tags: ['machine-learning', 'finance', 'risk-management', 'fraud-detection'],
        status: 'published',
        isFeatured: false,
        publishedAt: new Date(Date.now() - 172800000), // 2 days ago
        readTime: 10,
        views: 756,
        likes: 28
      },
      {
        title: 'Computer Vision Applications in Manufacturing: Quality Control Revolution',
        slug: 'computer-vision-manufacturing-quality-control-revolution',
        excerpt: 'How computer vision is transforming quality control processes in manufacturing industries.',
        content: 'Manufacturing companies are increasingly turning to computer vision to improve quality control and reduce defects. With advances in deep learning and image processing, computer vision systems can now detect minute defects that human inspectors might miss. This article explores the latest computer vision applications in manufacturing.',
        authorId: createdUsers[4]._id,
        authorName: 'Emily Davis',
        category: 'Computer Vision',
        industry: 'Manufacturing',
        tags: ['computer-vision', 'manufacturing', 'quality-control', 'automation'],
        status: 'published',
        isFeatured: false,
        publishedAt: new Date(Date.now() - 259200000), // 3 days ago
        readTime: 7,
        views: 634,
        likes: 19
      }
    ];

    const createdBlogs = await Blog.insertMany(blogs);
    console.log(`✅ Created ${createdBlogs.length} blogs`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${createdUsers.length} users created`);
    console.log(`- ${createdCompanies.length} companies created`);
    console.log(`- ${createdSolutions.length} solutions created`);
    console.log(`- ${createdQueries.length} queries created`);
    console.log(`- ${createdReviews.length} reviews created`);
    console.log(`- ${createdBlogs.length} blogs created`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('SuperAdmin: SuperAdmin@medicodio.com / SuperAdmin@#123');
    console.log('Vendor 1: john@techbot.ai / password123');
    console.log('Vendor 2: sarah@dataflow.ai / password123');
    console.log('Customer 1: emily.davis@company.com / password123');
    console.log('Customer 2: david.wilson@retail.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding script
seedDatabase();
