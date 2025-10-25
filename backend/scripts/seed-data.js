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
