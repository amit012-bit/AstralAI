import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import api, { companiesApi } from '../../lib/api';

// Form data interface
interface SolutionFormData {
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  industry: string;
  subcategory: string;
  companyId?: string; // For superadmin to select company
  tags: string[];
  features: Array<{
    name: string;
    description: string;
    icon: string;
  }>;
  pricing: {
    model: string;
    price: number;
    currency: string;
    billingCycle: string;
    customPricing: {
      available: boolean;
      description: string;
    };
  };
  deployment: {
    type: string;
    time: string;
    description: string;
    complexity: string;
  };
  capabilities: string[];
  technologies: string[];
  integrationRequirements: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    demoUrl: string;
    documentationUrl: string;
  };
  // New customer-focused fields
  valuePropositions: string[];
  performanceMetrics: Array<{
    metric: string;
    value: string;
    description: string;
  }>;
  aiTechnology: {
    approach: string;
    model: string;
    accuracy: string;
    processingTime: string;
  };
  useCases: string[];
  integrationHighlights: string[];
  trustIndicators: string[];
  quickBenefits: string[];
  implementationTime: string;
}

// Initial form data
const initialFormData: SolutionFormData = {
  title: '',
  shortDescription: '',
  description: '',
  category: '',
  industry: '',
  subcategory: '',
  tags: [],
  features: [{ name: '', description: '', icon: '' }],
  pricing: {
    model: '',
    price: 0,
    currency: 'USD',
    billingCycle: 'monthly',
    customPricing: {
      available: false,
      description: ''
    }
  },
  deployment: {
    type: '',
    time: '',
    description: '',
    complexity: ''
  },
  capabilities: [],
  technologies: [],
  integrationRequirements: '',
  contactInfo: {
    email: '',
    phone: '',
    address: '',
    demoUrl: '',
    documentationUrl: ''
  },
  // New customer-focused fields
  valuePropositions: [''],
  performanceMetrics: [{ metric: '', value: '', description: '' }],
  aiTechnology: {
    approach: '',
    model: '',
    accuracy: '',
    processingTime: ''
  },
  useCases: [''],
  integrationHighlights: [''],
  trustIndicators: [''],
  quickBenefits: [''],
  implementationTime: ''
};

// Options
const categories = [
  'Machine Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Robotics',
  'Predictive Analytics',
  'Chatbots',
  'Voice Recognition',
  'Data Processing',
  'Automation',
  'Other'
];

const industries = [
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Transportation',
  'Energy',
  'Government',
  'Technology',
  'Media',
  'Other'
];

const pricingModels = [
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'one-time', label: 'One-time Purchase' },
  { value: 'custom', label: 'Custom Pricing' },
  { value: 'contact', label: 'Contact for Pricing' }
];

const deploymentTypes = [
  { value: 'cloud', label: 'Cloud-based' },
  { value: 'on-premise', label: 'On-premise' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'saas', label: 'Software as a Service' },
  { value: 'api', label: 'API Integration' }
];

const NewSolutionPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState<SolutionFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [success, setSuccess] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);

  // Redirect if not authenticated or not a vendor
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (user?.role !== 'vendor' && user?.role !== 'superadmin') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  // Fetch companies for superadmin
  useEffect(() => {
    const fetchCompanies = async () => {
      if (user?.role === 'superadmin') {
        try {
          const response = await companiesApi.getCompanies();
          setCompanies(response.data || []);
        } catch (error) {
          console.error('Error fetching companies:', error);
        }
      }
    };

    fetchCompanies();
  }, [user?.role]);


  // Show loading while authentication is being checked
  if (isLoading) {
    return (
      <Layout title="Add Solution">
        <div className="min-h-screen bg-gray-800 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </Layout>
    );
  }

  // Don't render if not authenticated or not a vendor/superadmin
  if (!isAuthenticated || (user?.role !== 'vendor' && user?.role !== 'superadmin')) {
    return (
      <Layout title="Access Denied">
        <div className="min-h-screen bg-gray-800 flex items-center justify-center">
          <div className="text-white">Access denied. You must be a vendor or superadmin to add solutions.</div>
        </div>
      </Layout>
    );
  }

  // Input change handlers
  const handleInputChange = (field: keyof SolutionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: keyof SolutionFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  const handleDeepNestedChange = (parent: keyof SolutionFormData, child: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [child]: {
          ...(prev[parent] as any)[child],
          [field]: value
        }
      }
    }));
  };

  // Handle tags input
  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags }));
  };

  // Handle features
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { name: '', description: '', icon: '' }]
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index ? { ...feature, [field]: value } : feature
      )
    }));
  };

  // Handle capabilities input
  const handleCapabilitiesChange = (value: string) => {
    const capabilities = value.split(',').map(cap => cap.trim()).filter(cap => cap.length > 0);
    setFormData(prev => ({ ...prev, capabilities }));
  };

  // Handle technologies input
  const handleTechnologiesChange = (value: string) => {
    const technologies = value.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
    setFormData(prev => ({ ...prev, technologies }));
  };

  // Handle customer-focused fields
  const handleArrayFieldChange = (field: keyof SolutionFormData, value: string) => {
    const items = value.split('\n').map(item => item.trim()).filter(item => item.length > 0);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const addPerformanceMetric = () => {
    setFormData(prev => ({
      ...prev,
      performanceMetrics: [...prev.performanceMetrics, { metric: '', value: '', description: '' }]
    }));
  };

  const removePerformanceMetric = (index: number) => {
    setFormData(prev => ({
      ...prev,
      performanceMetrics: prev.performanceMetrics.filter((_, i) => i !== index)
    }));
  };

  const updatePerformanceMetric = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      performanceMetrics: prev.performanceMetrics.map((metric, i) =>
        i === index ? { ...metric, [field]: value } : metric
      )
    }));
  };

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/solutions', formData);
      
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/solutions');
        }, 2000);
      } else {
        setError(response.data.error || 'Failed to create solution');
      }
    } catch (error: any) {
      console.error('Error creating solution:', error);
      setError(error.response?.data?.error || 'Failed to create solution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Launch Your Solution to the World" 
    // subtitle="Showcase your cutting-edge AI solution to a global audience."
    >
      <Head>
        <title>Add New Solution - AstralAI</title>
        <meta name="description" content="Add a new AI solution to the AstralAI marketplace." />
      </Head>
      <div className="bg-gray-800 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-900 rounded-xl shadow-lg border border-gray-700 p-8"
          >
            <h1 className="text-3xl font-bold text-white mb-6 text-center">Launch Your Solution to the World</h1>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-900/50 border border-green-500 rounded-lg">
                <p className="text-green-200">Solution created successfully! Redirecting...</p>
              </div>
            )}

            {/* Progress Tracker */}
            <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6 mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => goToStep(step)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                        step === currentStep
                          ? 'bg-blue-600 text-white ring-4 ring-blue-600/20'
                          : step < currentStep
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {step < currentStep ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        step
                      )}
                    </button>
                    <span className={`ml-2 text-sm font-medium ${
                      step === currentStep ? 'text-blue-400' : step < currentStep ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {step === 1 && 'Basic Info'}
                      {step === 2 && 'Features'}
                      {step === 3 && 'Pricing'}
                      {step === 4 && 'Technical'}
                    </span>
                    {step < 4 && (
                      <div className={`ml-4 w-12 h-0.5 ${
                        step < currentStep ? 'bg-green-600' : 'bg-gray-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="bg-gray-900 shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="lg:col-span-2">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                        Solution Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        required
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your solution title"
                      />
                    </div>

                    {/* Short Description */}
                    <div className="lg:col-span-2">
                      <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-300 mb-2">
                        Short Description *
                      </label>
                      <textarea
                        id="shortDescription"
                        required
                        rows={3}
                        value={formData.shortDescription}
                        onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                        className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Brief description (max 200 characters)"
                        maxLength={200}
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        {formData.shortDescription.length}/200 characters
                      </p>
                    </div>

                    {/* Full Description */}
                    <div className="lg:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                        Full Description *
                      </label>
                      <textarea
                        id="description"
                        required
                        rows={6}
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Detailed description of your solution"
                        maxLength={2000}
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        {formData.description.length}/2000 characters
                      </p>
                    </div>

                    {/* Category and Industry */}
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                        Category *
                      </label>
                      <select
                        id="category"
                        required
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-2">
                        Industry *
                      </label>
                      <select
                        id="industry"
                        required
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select an industry</option>
                        {industries.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>

                    {/* Subcategory */}
                    <div>
                      <label htmlFor="subcategory" className="block text-sm font-medium text-gray-300 mb-2">
                        Subcategory
                      </label>
                      <input
                        type="text"
                        id="subcategory"
                        value={formData.subcategory}
                        onChange={(e) => handleInputChange('subcategory', e.target.value)}
                        className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Optional subcategory"
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                        Tags
                      </label>
                      <input
                        type="text"
                        id="tags"
                        value={formData.tags.join(', ')}
                        onChange={(e) => handleTagsChange(e.target.value)}
                        className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter tags separated by commas (e.g., AI, Machine Learning, Automation)"
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        Separate tags with commas
                      </p>
                    </div>

                    {/* Company Selection - Only for Superadmin */}
                    {user?.role === 'superadmin' && (
                      <div className="lg:col-span-2">
                        <label htmlFor="companyId" className="block text-sm font-medium text-gray-300 mb-2">
                          Company *
                        </label>
                        <select
                          id="companyId"
                          required
                          value={formData.companyId || ''}
                          onChange={(e) => handleInputChange('companyId', e.target.value)}
                          className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a company</option>
                          {companies.map(company => (
                            <option key={company._id} value={company._id}>
                              {company.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-sm text-gray-400 mt-1">
                          Select the company this solution belongs to
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Step Navigation Buttons */}
                  <div className="lg:col-span-2 flex justify-end pt-6 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Next Step
                      <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Features */}
              {currentStep === 2 && (
                <div className="bg-gray-900 shadow rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Features</h2>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add Feature
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Feature {index + 1}</h3>
                          {formData.features.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Feature Name
                            </label>
                            <input
                              type="text"
                              value={feature.name}
                              onChange={(e) => updateFeature(index, 'name', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Enter feature name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Feature Description
                            </label>
                            <textarea
                              rows={3}
                              value={feature.description}
                              onChange={(e) => updateFeature(index, 'description', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Describe this feature"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Feature Icon
                            </label>
                            <input
                              type="text"
                              value={feature.icon}
                              onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Icon name or URL"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Step Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex items-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="mr-2 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Next Step
                      <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Pricing */}
              {currentStep === 3 && (
                <div className="bg-gray-900 shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Pricing Information</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pricing Model */}
                    <div>
                      <label htmlFor="pricingModel" className="block text-sm font-medium text-gray-300 mb-2">
                        Pricing Model *
                      </label>
                      <select
                        id="pricingModel"
                        required
                        value={formData.pricing.model}
                        onChange={(e) => handleNestedChange('pricing', 'model', e.target.value)}
                        className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select pricing model</option>
                        {pricingModels.map(model => (
                          <option key={model.value} value={model.value}>{model.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Price */}
                    {formData.pricing.model && formData.pricing.model !== 'free' && formData.pricing.model !== 'contact' && (
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                          Price
                        </label>
                        <div className="flex">
                          <select
                            value={formData.pricing.currency}
                            onChange={(e) => handleNestedChange('pricing', 'currency', e.target.value)}
                            className="border border-gray-600 rounded-l-md px-3 py-2 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                          </select>
                          <input
                            type="number"
                            id="price"
                            value={formData.pricing.price}
                            onChange={(e) => handleNestedChange('pricing', 'price', parseFloat(e.target.value) || 0)}
                            className="flex-1 border border-gray-600 border-l-0 rounded-r-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    )}

                    {/* Billing Cycle */}
                    {formData.pricing.model === 'subscription' && (
                      <div>
                        <label htmlFor="billingCycle" className="block text-sm font-medium text-gray-300 mb-2">
                          Billing Cycle
                        </label>
                        <select
                          id="billingCycle"
                          value={formData.pricing.billingCycle}
                          onChange={(e) => handleNestedChange('pricing', 'billingCycle', e.target.value)}
                          className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                          <option value="quarterly">Quarterly</option>
                        </select>
                      </div>
                    )}

                    {/* Custom Pricing */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="customPricing"
                          checked={formData.pricing.customPricing.available}
                          onChange={(e) => handleDeepNestedChange('pricing', 'customPricing', 'available', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="customPricing" className="ml-2 block text-sm text-gray-300">
                          Offer custom pricing options
                        </label>
                      </div>
                    </div>

                    {formData.pricing.customPricing.available && (
                      <div className="lg:col-span-2">
                        <label htmlFor="customPricingDescription" className="block text-sm font-medium text-gray-300 mb-2">
                          Custom Pricing Description
                        </label>
                        <textarea
                          id="customPricingDescription"
                          rows={3}
                          value={formData.pricing.customPricing.description}
                          onChange={(e) => handleDeepNestedChange('pricing', 'customPricing', 'description', e.target.value)}
                          className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Describe your custom pricing options"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Deployment Information */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Deployment Information</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="deploymentType" className="block text-sm font-medium text-gray-300 mb-2">
                          Deployment Type *
                        </label>
                        <select
                          id="deploymentType"
                          required
                          value={formData.deployment.type}
                          onChange={(e) => handleNestedChange('deployment', 'type', e.target.value)}
                          className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select deployment type</option>
                          {deploymentTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="deploymentTime" className="block text-sm font-medium text-gray-300 mb-2">
                          Deployment Time
                        </label>
                        <select
                          id="deploymentTime"
                          value={formData.deployment.time}
                          onChange={(e) => handleNestedChange('deployment', 'time', e.target.value)}
                          className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select deployment time</option>
                          <option value="instant">Instant</option>
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                        </select>
                      </div>

                      <div className="lg:col-span-2">
                        <label htmlFor="deploymentDescription" className="block text-sm font-medium text-gray-300 mb-2">
                          Deployment Description
                        </label>
                        <textarea
                          id="deploymentDescription"
                          rows={3}
                          value={formData.deployment.description}
                          onChange={(e) => handleNestedChange('deployment', 'description', e.target.value)}
                          className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Describe deployment process and requirements"
                        />
                      </div>

                      <div>
                        <label htmlFor="deploymentComplexity" className="block text-sm font-medium text-gray-300 mb-2">
                          Deployment Complexity
                        </label>
                        <select
                          id="deploymentComplexity"
                          value={formData.deployment.complexity}
                          onChange={(e) => handleNestedChange('deployment', 'complexity', e.target.value)}
                          className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select complexity</option>
                          <option value="simple">Simple</option>
                          <option value="moderate">Moderate</option>
                          <option value="complex">Complex</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Step Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex items-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="mr-2 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Next Step
                      <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Technical Details */}
              {currentStep === 4 && (
                <div className="bg-gray-900 shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Technical Details</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="capabilities" className="block text-sm font-medium text-gray-300 mb-2">
                        Capabilities
                      </label>
                      <input
                        type="text"
                        id="capabilities"
                        value={formData.capabilities.join(', ')}
                        onChange={(e) => handleCapabilitiesChange(e.target.value)}
                        className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter capabilities separated by commas"
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        What can your solution do? (e.g., Image Recognition, Text Analysis, Predictive Analytics)
                      </p>
                    </div>

                    <div>
                      <label htmlFor="technologies" className="block text-sm font-medium text-gray-300 mb-2">
                        Technologies
                      </label>
                      <input
                        type="text"
                        id="technologies"
                        value={formData.technologies.join(', ')}
                        onChange={(e) => handleTechnologiesChange(e.target.value)}
                        className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter technologies separated by commas"
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        Technologies used in your solution (e.g., Python, TensorFlow, React, AWS)
                      </p>
                    </div>

                    <div className="lg:col-span-2">
                      <label htmlFor="integrationRequirements" className="block text-sm font-medium text-gray-300 mb-2">
                        Integration Requirements
                      </label>
                      <textarea
                        id="integrationRequirements"
                        rows={4}
                        value={formData.integrationRequirements}
                        onChange={(e) => handleInputChange('integrationRequirements', e.target.value)}
                        className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe any integration requirements, APIs, or dependencies needed"
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        What systems or tools does your solution integrate with?
                      </p>
                    </div>

                    {/* Contact Information */}
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-300 mb-2">
                            Contact Email *
                          </label>
                          <input
                            type="email"
                            id="contactEmail"
                            required
                            value={formData.contactInfo.email}
                            onChange={(e) => handleNestedChange('contactInfo', 'email', e.target.value)}
                            className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="contact@yourcompany.com"
                          />
                        </div>

                        <div>
                          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-300 mb-2">
                            Contact Phone
                          </label>
                          <input
                            type="tel"
                            id="contactPhone"
                            value={formData.contactInfo.phone}
                            onChange={(e) => handleNestedChange('contactInfo', 'phone', e.target.value)}
                            className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>

                        <div>
                          <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-300 mb-2">
                            Demo URL
                          </label>
                          <input
                            type="url"
                            id="demoUrl"
                            value={formData.contactInfo.demoUrl}
                            onChange={(e) => handleNestedChange('contactInfo', 'demoUrl', e.target.value)}
                            className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://demo.yourcompany.com"
                          />
                        </div>

                        <div>
                          <label htmlFor="documentationUrl" className="block text-sm font-medium text-gray-300 mb-2">
                            Documentation URL
                          </label>
                          <input
                            type="url"
                            id="documentationUrl"
                            value={formData.contactInfo.documentationUrl}
                            onChange={(e) => handleNestedChange('contactInfo', 'documentationUrl', e.target.value)}
                            className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://docs.example.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Step Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex items-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="mr-2 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      Previous
                    </button>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 border border-gray-600 rounded-md text-base font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 border border-transparent rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Creating Solution...' : 'Create Solution'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Customer-Focused Metrics */}
              {currentStep === 5 && (
                <div className="bg-gray-900 shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">🚀 Customer-Focused Metrics</h2>
                  <p className="text-gray-400 mb-6">Help customers understand the value and capabilities of your solution</p>
                  
                  <div className="space-y-8">
                    {/* Value Propositions */}
                    <div>
                      <label htmlFor="valuePropositions" className="block text-sm font-medium text-gray-300 mb-2">
                        🚀 Key Value Propositions *
                      </label>
                      <textarea
                        id="valuePropositions"
                        required
                        rows={4}
                        value={formData.valuePropositions.join('\n')}
                        onChange={(e) => handleArrayFieldChange('valuePropositions', e.target.value)}
                        className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="• Reduces customer support costs by 70%&#10;• Boosts sales conversion with AI-powered recommendations&#10;• Automates 90% of routine business processes&#10;• Predicts equipment failures 48 hours in advance"
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        What problems does your solution solve? What advantages does it provide? (One per line)
                      </p>
                    </div>

                    {/* Performance Metrics */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-gray-300">
                          📊 Performance Metrics *
                        </label>
                        <button
                          type="button"
                          onClick={addPerformanceMetric}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          + Add Metric
                        </button>
                      </div>
                      <div className="space-y-4">
                        {formData.performanceMetrics.map((metric, index) => (
                          <div key={index} className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 border border-gray-700 rounded-lg">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Metric</label>
                              <input
                                type="text"
                                value={metric.metric}
                                onChange={(e) => updatePerformanceMetric(index, 'metric', e.target.value)}
                                className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Accuracy Rate"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Value</label>
                              <input
                                type="text"
                                value={metric.value}
                                onChange={(e) => updatePerformanceMetric(index, 'value', e.target.value)}
                                className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., 98%"
                              />
                            </div>
                            <div className="flex items-end">
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                                <input
                                  type="text"
                                  value={metric.description}
                                  onChange={(e) => updatePerformanceMetric(index, 'description', e.target.value)}
                                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Brief description"
                                />
                              </div>
                              {formData.performanceMetrics.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removePerformanceMetric(index)}
                                  className="ml-2 text-red-400 hover:text-red-300"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Technology */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">🧠 AI Technology</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="aiApproach" className="block text-sm font-medium text-gray-300 mb-2">
                            AI Approach *
                          </label>
                          <input
                            type="text"
                            id="aiApproach"
                            required
                            value={formData.aiTechnology.approach}
                            onChange={(e) => handleNestedChange('aiTechnology', 'approach', e.target.value)}
                            className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Large Language Models (GPT-4), Computer Vision, Deep Learning"
                          />
                        </div>
                        <div>
                          <label htmlFor="aiModel" className="block text-sm font-medium text-gray-300 mb-2">
                            Model/Technology *
                          </label>
                          <input
                            type="text"
                            id="aiModel"
                            required
                            value={formData.aiTechnology.model}
                            onChange={(e) => handleNestedChange('aiTechnology', 'model', e.target.value)}
                            className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., GPT-4, TensorFlow, PyTorch, Custom Neural Network"
                          />
                        </div>
                        <div>
                          <label htmlFor="aiAccuracy" className="block text-sm font-medium text-gray-300 mb-2">
                            Accuracy/Performance
                          </label>
                          <input
                            type="text"
                            id="aiAccuracy"
                            value={formData.aiTechnology.accuracy}
                            onChange={(e) => handleNestedChange('aiTechnology', 'accuracy', e.target.value)}
                            className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 98% accuracy, 99.9% uptime"
                          />
                        </div>
                        <div>
                          <label htmlFor="aiProcessingTime" className="block text-sm font-medium text-gray-300 mb-2">
                            Processing Time
                          </label>
                          <input
                            type="text"
                            id="aiProcessingTime"
                            value={formData.aiTechnology.processingTime}
                            onChange={(e) => handleNestedChange('aiTechnology', 'processingTime', e.target.value)}
                            className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., <100ms response time, Real-time processing"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Use Cases */}
                    <div>
                      <label htmlFor="useCases" className="block text-sm font-medium text-gray-300 mb-2">
                        🎯 Primary Use Cases *
                      </label>
                      <textarea
                        id="useCases"
                        required
                        rows={3}
                        value={formData.useCases.join('\n')}
                        onChange={(e) => handleArrayFieldChange('useCases', e.target.value)}
                        className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="• Perfect for E-commerce Personalization&#10;• Ideal for Healthcare Diagnostics&#10;• Optimized for Financial Risk Assessment&#10;• Designed for Manufacturing Quality Control"
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        How is your solution typically used? (One per line)
                      </p>
                    </div>

                    {/* Integration Highlights */}
                    <div>
                      <label htmlFor="integrationHighlights" className="block text-sm font-medium text-gray-300 mb-2">
                        🔗 Integration Highlights *
                      </label>
                      <textarea
                        id="integrationHighlights"
                        required
                        rows={3}
                        value={formData.integrationHighlights.join('\n')}
                        onChange={(e) => handleArrayFieldChange('integrationHighlights', e.target.value)}
                        className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="• Seamless API Integration&#10;• Works with Salesforce, HubSpot, Shopify&#10;• One-Click Deployment&#10;• RESTful API with 99.9% SLA"
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        What makes integration easy? (One per line)
                      </p>
                    </div>

                    {/* Trust Indicators */}
                    <div>
                      <label htmlFor="trustIndicators" className="block text-sm font-medium text-gray-300 mb-2">
                        🏆 Trust Indicators
                      </label>
                      <textarea
                        id="trustIndicators"
                        rows={3}
                        value={formData.trustIndicators.join('\n')}
                        onChange={(e) => handleArrayFieldChange('trustIndicators', e.target.value)}
                        className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="• Used by Fortune 500 Companies&#10;• SOC 2 Type II Certified&#10;• GDPR Compliant&#10;• Enterprise-Grade Security"
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        What demonstrates credibility and reliability? (One per line)
                      </p>
                    </div>

                    {/* Quick Benefits */}
                    <div>
                      <label htmlFor="quickBenefits" className="block text-sm font-medium text-gray-300 mb-2">
                        💡 Quick Benefits *
                      </label>
                      <textarea
                        id="quickBenefits"
                        required
                        rows={3}
                        value={formData.quickBenefits.join('\n')}
                        onChange={(e) => handleArrayFieldChange('quickBenefits', e.target.value)}
                        className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="• Saves 20 hours/week on manual tasks&#10;• Increases revenue by 25% through better targeting&#10;• Reduces operational costs by 40%"
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        What immediate value does your solution provide? (One per line)
                      </p>
                    </div>

                    {/* Implementation Time */}
                    <div>
                      <label htmlFor="implementationTime" className="block text-sm font-medium text-gray-300 mb-2">
                        ⚡ Implementation Time *
                      </label>
                      <input
                        type="text"
                        id="implementationTime"
                        required
                        value={formData.implementationTime}
                        onChange={(e) => handleInputChange('implementationTime', e.target.value)}
                        className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Deploy in 15 minutes, No-code setup required, 24/7 Support included"
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        How quickly can customers get started?
                      </p>
                    </div>
                  </div>
                  
                  {/* Step Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex items-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="mr-2 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      Previous
                    </button>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 border border-gray-600 rounded-md text-base font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 border border-transparent rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Creating Solution...' : 'Create Solution'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default NewSolutionPage;