/**
 * Categories Page - AI Solution Categories
 * Browse AI solutions by categories with statistics and featured solutions
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  SparklesIcon,
  ArrowRightIcon,
  ChartBarIcon,
  TagIcon,
  BuildingOfficeIcon,
  TrendingUpIcon,
  StarIcon,
  EyeIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useFeaturedSolutions } from '@/hooks/useSolutions';
import Layout from '@/components/Layout/Layout';
import Link from 'next/link';

// AI Solution Categories with descriptions and stats
const CATEGORIES = [
  {
    id: 'chatbots',
    name: 'Chatbots',
    description: 'AI-powered conversational agents for customer service, sales, and support',
    icon: '🤖',
    stats: { solutions: 45, companies: 12, avgRating: 4.7 },
    popularTags: ['Customer Service', 'Sales', 'Support', 'NLP'],
    industries: ['E-commerce', 'Healthcare', 'Finance', 'Retail']
  },
  {
    id: 'predictive-analytics',
    name: 'Predictive Analytics',
    description: 'Machine learning models for forecasting, risk assessment, and data insights',
    icon: '📊',
    stats: { solutions: 32, companies: 8, avgRating: 4.8 },
    popularTags: ['Forecasting', 'Risk Assessment', 'Data Science', 'ML'],
    industries: ['Finance', 'Healthcare', 'Manufacturing', 'Retail']
  },
  {
    id: 'computer-vision',
    name: 'Computer Vision',
    description: 'Image recognition, object detection, and visual AI applications',
    icon: '👁️',
    stats: { solutions: 28, companies: 6, avgRating: 4.6 },
    popularTags: ['Image Recognition', 'Object Detection', 'Medical Imaging', 'Security'],
    industries: ['Healthcare', 'Automotive', 'Security', 'Manufacturing']
  },
  {
    id: 'recommendation-systems',
    name: 'Recommendation Systems',
    description: 'Personalized content and product recommendations using AI',
    icon: '🎯',
    stats: { solutions: 24, companies: 7, avgRating: 4.5 },
    popularTags: ['Personalization', 'E-commerce', 'Content', 'Collaborative Filtering'],
    industries: ['E-commerce', 'Media', 'Gaming', 'Education']
  },
  {
    id: 'natural-language-processing',
    name: 'Natural Language Processing',
    description: 'Text analysis, sentiment analysis, and language understanding',
    icon: '📝',
    stats: { solutions: 36, companies: 10, avgRating: 4.4 },
    popularTags: ['Sentiment Analysis', 'Text Mining', 'Translation', 'Summarization'],
    industries: ['Finance', 'Media', 'Legal', 'Customer Service']
  },
  {
    id: 'machine-learning',
    name: 'Machine Learning',
    description: 'ML platforms, model training, and automated ML solutions',
    icon: '🧠',
    stats: { solutions: 41, companies: 9, avgRating: 4.6 },
    popularTags: ['Model Training', 'AutoML', 'MLOps', 'Deep Learning'],
    industries: ['Technology', 'Finance', 'Healthcare', 'Manufacturing']
  },
  {
    id: 'robotic-process-automation',
    name: 'Robotic Process Automation',
    description: 'Automated workflows and business process optimization',
    icon: '⚙️',
    stats: { solutions: 19, companies: 5, avgRating: 4.3 },
    popularTags: ['Workflow Automation', 'Process Optimization', 'BPA', 'Integration'],
    industries: ['Finance', 'Healthcare', 'Manufacturing', 'Government']
  },
  {
    id: 'voice-recognition',
    name: 'Voice Recognition',
    description: 'Speech-to-text, voice assistants, and audio processing',
    icon: '🎤',
    stats: { solutions: 15, companies: 4, avgRating: 4.2 },
    popularTags: ['Speech-to-Text', 'Voice Assistants', 'Audio Processing', 'ASR'],
    industries: ['Healthcare', 'Automotive', 'Customer Service', 'Accessibility']
  },
  {
    id: 'image-recognition',
    name: 'Image Recognition',
    description: 'Visual search, image classification, and visual content analysis',
    icon: '🖼️',
    stats: { solutions: 22, companies: 6, avgRating: 4.5 },
    popularTags: ['Visual Search', 'Image Classification', 'Content Moderation', 'OCR'],
    industries: ['E-commerce', 'Social Media', 'Security', 'Publishing']
  },
  {
    id: 'sentiment-analysis',
    name: 'Sentiment Analysis',
    description: 'Emotion detection, opinion mining, and social media monitoring',
    icon: '😊',
    stats: { solutions: 18, companies: 5, avgRating: 4.4 },
    popularTags: ['Emotion Detection', 'Opinion Mining', 'Social Monitoring', 'Brand Analysis'],
    industries: ['Marketing', 'Media', 'Finance', 'Customer Service']
  }
];

const CategoriesPage: React.FC = () => {
  const router = useRouter();
  
  // Fetch featured solutions for each category
  const { data: featuredData } = useFeaturedSolutions(20);
  const featuredSolutions = featuredData?.solutions || [];

  // Group solutions by category
  const solutionsByCategory = CATEGORIES.reduce((acc, category) => {
    acc[category.id] = featuredSolutions.filter((solution: any) => 
      solution.category.toLowerCase().replace(/\s+/g, '-') === category.id
    );
    return acc;
  }, {} as Record<string, any[]>);

  // Handle category click
  const handleCategoryClick = (categoryId: string) => {
    router.push(`/solutions?category=${categoryId}`);
  };

  // Handle tag click
  const handleTagClick = (tag: string) => {
    router.push(`/solutions?search=${encodeURIComponent(tag)}`);
  };

  return (
    <Layout>
      <div className="bg-gray-800">
      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATEGORIES.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-gray-900 rounded-xl shadow-sm border border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => handleCategoryClick(category.id)}
            >
              {/* Category Header */}
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl">{category.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-300 mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">
                      {category.stats.solutions}
                    </div>
                    <div className="text-xs text-gray-400">Solutions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">
                      {category.stats.companies}
                    </div>
                    <div className="text-xs text-gray-400">Companies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">
                      {category.stats.avgRating}
                    </div>
                    <div className="text-xs text-gray-400">Avg Rating</div>
                  </div>
                </div>

                {/* Popular Tags */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-300 mb-2">Popular Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {category.popularTags.slice(0, 3).map((tag) => (
                      <button
                        key={tag}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTagClick(tag);
                        }}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300 hover:bg-blue-800/30 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                    {category.popularTags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        +{category.popularTags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Industries */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-300 mb-2">Popular Industries</div>
                  <div className="flex flex-wrap gap-1">
                    {category.industries.slice(0, 2).map((industry) => (
                      <span
                        key={industry}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300"
                      >
                        {industry}
                      </span>
                    ))}
                    {category.industries.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        +{category.industries.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Featured Solutions Preview */}
                {solutionsByCategory[category.id]?.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-300 mb-2">Featured Solutions</div>
                    <div className="space-y-2">
                      {solutionsByCategory[category.id].slice(0, 2).map((solution: any) => (
                        <div
                          key={solution._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/solutions/${solution._id}`);
                          }}
                          className="flex items-center space-x-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          <SparklesIcon className="h-4 w-4 text-blue-400" />
                          <span className="text-sm font-medium text-white truncate">
                            {solution.title}
                          </span>
                          {solution.rating && (
                            <div className="flex items-center space-x-1 ml-auto">
                              <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-400">
                                {solution.rating.average.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* View Solutions Button */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {category.stats.solutions} solutions available
                  </span>
                  <ArrowRightIcon className="h-5 w-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Browse all AI solutions or post a query to get personalized recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/solutions">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
                >
                  <span>Browse All Solutions</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </motion.button>
              </Link>
              <Link href="/queries/new">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-700 transition-colors"
                >
                  <span>Post a Query</span>
                  <SparklesIcon className="h-5 w-5" />
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default CategoriesPage;
