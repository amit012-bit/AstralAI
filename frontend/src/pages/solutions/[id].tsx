import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import ParticleRing from '../../components/Background/ParticleRing';
import {
  SparklesIcon,
  StarIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CloudIcon,
  CpuChipIcon,
  UserGroupIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface Solution {
  _id: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  industry: string;
  subcategory: string;
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
  vendor: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    website: string;
  };
  rating: {
    average: number;
    count: number;
  };
  views: number;
  likes: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  // New customer-focused metrics
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

const SolutionDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAuth();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  // Fetch solution details
  useEffect(() => {
    if (id) {
      fetchSolution();
    }
  }, [id]);

  const fetchSolution = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/solutions/${id}`);
      if (response.data.success) {
        setSolution(response.data.solution);
      } else {
        setError('Solution not found');
      }
    } catch (error: any) {
      console.error('Error fetching solution:', error);
      setError('Failed to load solution details');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await api.post(`/solutions/${id}/like`);
      if (response.data.success) {
        setIsLiked(!isLiked);
        if (solution) {
          setSolution({
            ...solution,
            likes: isLiked ? solution.likes - 1 : solution.likes + 1
          });
        }
      }
    } catch (error) {
      console.error('Error liking solution:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: solution?.title,
          text: solution?.shortDescription,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await api.post(`/solutions/${id}/contact`, {
        ...contactForm,
        solutionId: id,
        vendorId: solution?.vendor._id
      });

      if (response.data.success) {
        alert('Message sent successfully! The vendor will contact you soon.');
        setShowContactForm(false);
        setContactForm({ name: '', email: '', company: '', message: '' });
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const formatPrice = (pricing: any) => {
    if (!pricing) return 'Contact for pricing';
    
    if (pricing.model === 'free') return 'Free';
    if (pricing.model === 'contact') return 'Contact for pricing';
    if (pricing.model === 'custom') return 'Custom pricing';
    
    if (pricing.price) {
      const { amount, currency, period } = pricing.price;
      return `$${amount}/${period === 'monthly' ? 'mo' : period}`;
    }
    
    return 'Contact for pricing';
  };

  if (loading) {
    return (
      <Layout>
        <div className="bg-gray-800 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading solution details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !solution) {
    return (
      <Layout>
        <div className="bg-gray-800 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Solution Not Found</h1>
            <p className="text-gray-300 mb-6">The solution you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => router.push('/solutions')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Solutions
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{solution.title} - AstroVault AI</title>
        <meta name="description" content={solution.shortDescription} />
      </Head>
      
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* ParticleRing Background Animation */}
          <div className="absolute inset-0">
            <ParticleRing />
          </div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-r from-purple-600/5 to-blue-600/5"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              {/* Back Button */}
              <div className="flex justify-start mb-8">
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center px-4 py-2 text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-200 backdrop-blur-sm border border-gray-700/50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Solutions
                </button>
              </div>

              {/* Solution Title */}
              <div className="mb-6">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                  {solution.title}
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  {solution.shortDescription}
                </p>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-600/30 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {solution.rating?.average || '4.8'}
                  </div>
                  <div className="text-gray-300 text-sm">Rating</div>
                </div>
                <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-600/30 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {solution.views?.toLocaleString() || '2.3K'}
                  </div>
                  <div className="text-gray-300 text-sm">Views</div>
                </div>
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {solution.category}
                  </div>
                  <div className="text-gray-300 text-sm">Category</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-12"
          >
            {/* Company & Vendor Info */}
            {solution.vendor && (solution.vendor.company || solution.vendor.name) && (
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-8 border border-gray-600/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {solution.vendor?.company?.charAt(0) || 'C'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{solution.vendor?.company}</h3>
                      <p className="text-gray-300">by {solution.vendor?.name}</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleLike}
                      className={`px-6 py-3 rounded-xl transition-all duration-200 ${
                        isLiked 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : 'bg-gray-700/50 text-gray-300 border border-gray-600/50 hover:bg-gray-600/50'
                      }`}
                    >
                      <HeartIcon className="h-5 w-5 mr-2 inline" />
                      {solution.likes || 0}
                    </button>
                    <button
                      onClick={handleShare}
                      className="px-6 py-3 bg-gray-700/50 text-gray-300 border border-gray-600/50 rounded-xl hover:bg-gray-600/50 transition-all duration-200"
                    >
                      <ShareIcon className="h-5 w-5 mr-2 inline" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-8 border border-gray-600/50 backdrop-blur-sm">
                  <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm">📋</span>
                    </div>
                    About This Solution
                  </h2>
                  <p className="text-gray-300 leading-relaxed text-lg">{solution.description}</p>
                </div>

                {/* Features */}
                {solution.features && solution.features.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-8 border border-gray-600/50 backdrop-blur-sm">
                    <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white text-sm">✨</span>
                      </div>
                      Key Features
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {solution.features.map((feature: any, index: number) => (
                        <div key={index} className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl p-6 border border-gray-500/30 hover:border-green-500/30 transition-all duration-200">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                              <CheckCircleIcon className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                              <h3 className="font-bold text-white mb-2 text-lg">{feature.title}</h3>
                              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metrics Grid - Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-8">
                    {/* Value Propositions */}
                    {solution.valuePropositions && solution.valuePropositions.length > 0 && solution.valuePropositions.some(vp => vp && vp.trim()) && (
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-xs">🚀</span>
                          </div>
                          Key Value Propositions
                        </h2>
                        <div className="space-y-4">
                          {solution.valuePropositions.filter(vp => vp && vp.trim()).map((proposition: string, index: number) => (
                            <div key={index} className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-200">
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <CheckCircleIcon className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                  <p className="text-white font-semibold leading-relaxed">{proposition}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Performance Metrics */}
                    {solution.performanceMetrics && solution.performanceMetrics.length > 0 && solution.performanceMetrics.some(metric => metric && metric.metric && metric.metric.trim()) && (
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-xs">📊</span>
                          </div>
                          Performance Metrics
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                          {solution.performanceMetrics.filter(metric => metric && metric.metric && metric.metric.trim()).map((metric: any, index: number) => (
                            <div key={index} className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg p-4 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-200">
                              <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                              <div className="text-purple-300 font-semibold mb-2">{metric.metric}</div>
                              <div className="text-gray-300 text-sm leading-relaxed">{metric.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Use Cases */}
                    {solution.useCases && solution.useCases.length > 0 && solution.useCases.some(useCase => useCase && useCase.trim()) && (
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-xs">🎯</span>
                          </div>
                          Primary Use Cases
                        </h2>
                        <div className="space-y-4">
                          {solution.useCases.filter(useCase => useCase && useCase.trim()).map((useCase: string, index: number) => (
                            <div key={index} className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 border border-orange-500/20 hover:border-orange-400/40 transition-all duration-200">
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <CheckCircleIcon className="h-5 w-5 text-orange-400" />
                                </div>
                                <div>
                                  <p className="text-white font-semibold leading-relaxed">{useCase}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trust Indicators */}
                    {solution.trustIndicators && solution.trustIndicators.length > 0 && solution.trustIndicators.some(indicator => indicator && indicator.trim()) && (
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-xs">🛡️</span>
                          </div>
                          Trust Indicators
                        </h2>
                        <div className="space-y-4">
                          {solution.trustIndicators.filter(indicator => indicator && indicator.trim()).map((indicator: string, index: number) => (
                            <div key={index} className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20 hover:border-green-400/40 transition-all duration-200">
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                                </div>
                                <div>
                                  <p className="text-white font-semibold leading-relaxed">{indicator}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-8">
                    {/* AI Technology */}
                    {solution.aiTechnology && (solution.aiTechnology.approach || solution.aiTechnology.model || solution.aiTechnology.accuracy || solution.aiTechnology.processingTime) && (
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-xs">🧠</span>
                          </div>
                          AI Technology
                        </h2>
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-bold text-white mb-2">Approach</h3>
                              <p className="text-gray-300 leading-relaxed text-sm">{solution.aiTechnology.approach}</p>
                            </div>
                            <div>
                              <h3 className="font-bold text-white mb-2">Model</h3>
                              <p className="text-gray-300 leading-relaxed text-sm">{solution.aiTechnology.model}</p>
                            </div>
                            <div>
                              <h3 className="font-bold text-white mb-2">Accuracy</h3>
                              <p className="text-gray-300 leading-relaxed text-sm">{solution.aiTechnology.accuracy}</p>
                            </div>
                            <div>
                              <h3 className="font-bold text-white mb-2">Processing Time</h3>
                              <p className="text-gray-300 leading-relaxed text-sm">{solution.aiTechnology.processingTime}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Integration Highlights */}
                    {solution.integrationHighlights && solution.integrationHighlights.length > 0 && solution.integrationHighlights.some(highlight => highlight && highlight.trim()) && (
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-xs">🔗</span>
                          </div>
                          Integration Highlights
                        </h2>
                        <div className="space-y-4">
                          {solution.integrationHighlights.filter(highlight => highlight && highlight.trim()).map((highlight: string, index: number) => (
                            <div key={index} className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg p-4 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-200">
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <CheckCircleIcon className="h-5 w-5 text-cyan-400" />
                                </div>
                                <div>
                                  <p className="text-white font-semibold leading-relaxed">{highlight}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Benefits */}
                    {solution.quickBenefits && solution.quickBenefits.length > 0 && solution.quickBenefits.some(benefit => benefit && benefit.trim()) && (
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-xs">⚡</span>
                          </div>
                          Quick Benefits
                        </h2>
                        <div className="space-y-4">
                          {solution.quickBenefits.filter(benefit => benefit && benefit.trim()).map((benefit: string, index: number) => (
                            <div key={index} className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-200">
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <CheckCircleIcon className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div>
                                  <p className="text-white font-semibold leading-relaxed">{benefit}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Implementation Time */}
                    {solution.implementationTime && solution.implementationTime.trim() && (
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/50 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-xs">⏱️</span>
                          </div>
                          Implementation Time
                        </h2>
                        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg p-4 border border-indigo-500/20">
                          <p className="text-white font-semibold leading-relaxed">{solution.implementationTime}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/50 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        // TODO: Implement in-app contact functionality
                        console.log('Contact vendor via app');
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2.5 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Contact Vendor</span>
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implement in-app messaging functionality
                        console.log('Message vendor via app');
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Send Message</span>
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implement in-app request demo functionality
                        console.log('Request demo via app');
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Request Demo</span>
                    </button>
                  </div>
                </div>

                {/* Contact Form */}
                {solution.vendor && (solution.vendor.company || solution.vendor.name) && (
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/50 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-4">Contact Vendor</h3>
                  {!showContactForm ? (
                    <button
                      onClick={() => setShowContactForm(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                    >
                      Get in Touch
                    </button>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                        <input
                          type="text"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                        <input
                          type="text"
                          value={contactForm.company}
                          onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                          placeholder="Your company"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                        <textarea
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                          placeholder="Tell us about your project..."
                          required
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                        >
                          Send Message
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowContactForm(false)}
                          className="px-6 py-3 bg-gray-700/50 text-gray-300 border border-gray-600/50 rounded-xl hover:bg-gray-600/50 transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
                )}

                {/* Vendor Info */}
                {solution.vendor && (solution.vendor.email || solution.vendor.phone || solution.vendor.website) && (
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-8 border border-gray-600/50 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white mb-6">Vendor Details</h3>
                    <div className="space-y-4">
                      {solution.vendor.email && (
                        <div className="flex items-center space-x-3">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-300">{solution.vendor.email}</span>
                        </div>
                      )}
                      {solution.vendor.phone && (
                        <div className="flex items-center space-x-3">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-300">{solution.vendor.phone}</span>
                        </div>
                      )}
                      {solution.vendor.website && (
                        <div className="flex items-center space-x-3">
                          <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                          <a href={solution.vendor.website} className="text-blue-400 hover:text-blue-300 transition-colors">
                            {solution.vendor.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                {solution.contactInfo && (
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-8 border border-gray-600/50 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
                    <div className="space-y-4">
                      {solution.contactInfo.email && (
                        <div className="flex items-center space-x-3">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-300">{solution.contactInfo.email}</span>
                        </div>
                      )}
                      {solution.contactInfo.phone && (
                        <div className="flex items-center space-x-3">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-300">{solution.contactInfo.phone}</span>
                        </div>
                      )}
                      {solution.contactInfo.demoUrl && (
                        <div className="flex items-center space-x-3">
                          <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                          <a href={solution.contactInfo.demoUrl} className="text-blue-400 hover:text-blue-300 transition-colors">
                            View Demo
                          </a>
                        </div>
                      )}
                      {solution.contactInfo.documentationUrl && (
                        <div className="flex items-center space-x-3">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                          <a href={solution.contactInfo.documentationUrl} className="text-blue-400 hover:text-blue-300 transition-colors">
                            Documentation
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Solution Summary */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/50 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white mb-4">Solution Summary</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Category</span>
                      <span className="text-white font-medium">{solution.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Industry</span>
                      <span className="text-white font-medium">{solution.industry}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Deployment</span>
                      <span className="text-white font-medium">{solution.deployment?.type || 'Cloud'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Pricing</span>
                      <span className="text-white font-medium">{solution.pricing?.model || 'Contact for pricing'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Rating</span>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-white font-medium">{solution.rating?.average?.toFixed(1) || '4.8'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Benefits */}
                {solution.quickBenefits && solution.quickBenefits.length > 0 && solution.quickBenefits.some(benefit => benefit && benefit.trim()) && (
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/50 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-4">Key Benefits</h3>
                    <div className="space-y-3">
                      {solution.quickBenefits.filter(benefit => benefit && benefit.trim()).slice(0, 4).map((benefit: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Solutions */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/50 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white mb-4">Related Solutions</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-700/30 rounded-lg p-3 hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">AI Chatbot Pro</p>
                          <p className="text-xs text-gray-400">Chatbots</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-3 hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">Smart Analytics</p>
                          <p className="text-xs text-gray-400">Analytics</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-3 hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">Vision AI</p>
                          <p className="text-xs text-gray-400">Computer Vision</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-4 text-sm text-blue-400 hover:text-blue-300 font-medium">
                    View All Related →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default SolutionDetailPage;