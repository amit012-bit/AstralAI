/**
 * Vendors Page - Database-driven Company Listings
 * Displays verified AI solution vendors with filtering and search
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  PhoneIcon,
  MailIcon,
  StarIcon,
  EyeIcon,
  CheckBadgeIcon,
  SparklesIcon,
  TagIcon,
  UserGroupIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import Layout from '@/components/Layout/Layout';

// Sample vendor data (in a real app, this would come from the database)
const VENDORS = [
  {
    _id: '1',
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
    rating: { average: 4.8, count: 156 },
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop',
    founded: '2019',
    location: 'San Francisco, CA',
    solutions: 12,
    employees: 150,
    clients: 500
  },
  {
    _id: '2',
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
    rating: { average: 4.6, count: 89 },
    logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&h=150&fit=crop',
    founded: '2018',
    location: 'New York, NY',
    solutions: 8,
    employees: 300,
    clients: 200
  },
  {
    _id: '3',
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
    rating: { average: 4.9, count: 234 },
    logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=150&h=150&fit=crop',
    founded: '2020',
    location: 'Boston, MA',
    solutions: 6,
    employees: 45,
    clients: 120
  },
  {
    _id: '4',
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
    rating: { average: 4.5, count: 67 },
    logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=150&h=150&fit=crop',
    founded: '2021',
    location: 'Austin, TX',
    solutions: 4,
    employees: 80,
    clients: 150
  },
  {
    _id: '5',
    name: 'FinTech AI Labs',
    slug: 'fintech-ai-labs',
    description: 'Advanced AI solutions for financial services and risk management.',
    website: 'https://fintechailabs.com',
    industry: 'Finance',
    companySize: '201-500',
    email: 'contact@fintechailabs.com',
    phone: '+1-555-FINTECH-AI',
    categories: ['Finance', 'Risk Management', 'Fraud Detection'],
    isVerified: true,
    rating: { average: 4.7, count: 145 },
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&h=150&fit=crop',
    founded: '2017',
    location: 'Chicago, IL',
    solutions: 15,
    employees: 250,
    clients: 300
  },
  {
    _id: '6',
    name: 'EduTech AI',
    slug: 'edutech-ai',
    description: 'Personalized learning solutions powered by artificial intelligence.',
    website: 'https://edutechai.com',
    industry: 'Education',
    companySize: '11-50',
    email: 'hello@edutechai.com',
    phone: '+1-555-EDU-TECH',
    categories: ['Education', 'Personalized Learning', 'NLP'],
    isVerified: true,
    rating: { average: 4.4, count: 98 },
    logo: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&h=150&fit=crop',
    founded: '2019',
    location: 'Seattle, WA',
    solutions: 7,
    employees: 35,
    clients: 80
  }
];

const INDUSTRIES = [
  'All Industries',
  'Technology',
  'Healthcare',
  'Finance',
  'E-commerce',
  'Education',
  'Manufacturing'
];

const COMPANY_SIZES = [
  'All Sizes',
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '500+'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'solutions', label: 'Most Solutions' },
  { value: 'verified', label: 'Verified First' }
];

interface FilterState {
  search: string;
  industry: string;
  companySize: string;
  verified: boolean | null;
  sort: string;
  viewMode: 'grid' | 'list';
}

const VendorsPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    industry: 'All Industries',
    companySize: 'All Sizes',
    verified: null,
    sort: 'verified',
    viewMode: 'grid'
  });

  // Filter and sort vendors
  const filteredVendors = VENDORS
    .filter(vendor => {
      if (filters.search && !vendor.name.toLowerCase().includes(filters.search.toLowerCase()) && 
          !vendor.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.industry !== 'All Industries' && vendor.industry !== filters.industry) {
        return false;
      }
      if (filters.companySize !== 'All Sizes' && vendor.companySize !== filters.companySize) {
        return false;
      }
      if (filters.verified !== null && vendor.isVerified !== filters.verified) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case 'oldest':
          return parseInt(a.founded) - parseInt(b.founded);
        case 'rating':
          return b.rating.average - a.rating.average;
        case 'solutions':
          return b.solutions - a.solutions;
        case 'verified':
          return (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0);
        default:
          return parseInt(b.founded) - parseInt(a.founded);
      }
    });

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      industry: 'All Industries',
      companySize: 'All Sizes',
      verified: null,
      sort: 'verified',
      viewMode: filters.viewMode
    });
  };

  const handleVendorClick = (slug: string) => {
    router.push(`/vendors/${slug}`);
  };

  return (
    <Layout>
      <div className="bg-gray-800">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Verified AI Vendors
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Discover trusted AI solution providers who have been verified for quality, 
              reliability, and expertise. Connect with industry leaders.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Vendors
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search vendors..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Industry Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={filters.industry}
                  onChange={(e) => handleFilterChange('industry', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company Size Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size
                </label>
                <select
                  value={filters.companySize}
                  onChange={(e) => handleFilterChange('companySize', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {COMPANY_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Verification Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Status
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="verified"
                      checked={filters.verified === null}
                      onChange={() => handleFilterChange('verified', null)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">All</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="verified"
                      checked={filters.verified === true}
                      onChange={() => handleFilterChange('verified', true)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Verified Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="verified"
                      checked={filters.verified === false}
                      onChange={() => handleFilterChange('verified', false)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Unverified</span>
                  </label>
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{filteredVendors.length}</span> vendors
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFilterChange('viewMode', 'grid')}
                    className={`p-2 rounded-md ${
                      filters.viewMode === 'grid'
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <FunnelIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleFilterChange('viewMode', 'list')}
                    className={`p-2 rounded-md ${
                      filters.viewMode === 'list'
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <BuildingOfficeIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Vendors Grid/List */}
            <AnimatePresence mode="wait">
              {filters.viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {filteredVendors.map((vendor, index) => (
                    <motion.div
                      key={vendor._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleVendorClick(vendor.slug)}
                    >
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="flex-shrink-0">
                            <img
                              src={vendor.logo}
                              alt={vendor.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {vendor.name}
                              </h3>
                              {vendor.isVerified && (
                                <CheckBadgeIcon className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {vendor.description}
                            </p>
                          </div>
                        </div>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {vendor.categories.slice(0, 3).map((category) => (
                            <span key={category} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {category}
                            </span>
                          ))}
                          {vendor.categories.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              +{vendor.categories.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary-600">
                              {vendor.solutions}
                            </div>
                            <div className="text-xs text-gray-500">Solutions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary-600">
                              {vendor.employees}
                            </div>
                            <div className="text-xs text-gray-500">Employees</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary-600">
                              {vendor.clients}
                            </div>
                            <div className="text-xs text-gray-500">Clients</div>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium text-gray-900">
                              {vendor.rating.average.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({vendor.rating.count})
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {vendor.location}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {filteredVendors.map((vendor, index) => (
                    <motion.div
                      key={vendor._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleVendorClick(vendor.slug)}
                    >
                      <div className="flex items-start space-x-6">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                          <img
                            src={vendor.logo}
                            alt={vendor.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {vendor.name}
                                </h3>
                                {vendor.isVerified && (
                                  <CheckBadgeIcon className="h-5 w-5 text-green-500" />
                                )}
                              </div>
                              <p className="text-gray-600 mb-3 line-clamp-2">
                                {vendor.description}
                              </p>
                              
                              {/* Categories */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                {vendor.categories.map((category) => (
                                  <span key={category} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                    {category}
                                  </span>
                                ))}
                              </div>

                              {/* Contact Info */}
                              <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <GlobeAltIcon className="h-4 w-4" />
                                  <span>{vendor.website}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <BuildingOfficeIcon className="h-4 w-4" />
                                  <span>{vendor.location}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <UserGroupIcon className="h-4 w-4" />
                                  <span>{vendor.companySize} employees</span>
                                </div>
                              </div>
                            </div>

                            {/* Stats and Rating */}
                            <div className="flex flex-col items-end space-y-2">
                              <div className="flex items-center space-x-1">
                                <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium text-gray-900">
                                  {vendor.rating.average.toFixed(1)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({vendor.rating.count})
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {vendor.solutions} solutions
                              </div>
                              <div className="text-sm text-gray-500">
                                Founded {vendor.founded}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State */}
            {filteredVendors.length === 0 && (
              <div className="text-center py-12">
                <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms to find more vendors.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Are You an AI Vendor?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join our platform to showcase your AI solutions and connect with businesses looking for your expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
                >
                  <span>Join as Vendor</span>
                  <BuildingOfficeIcon className="h-5 w-5" />
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-700 transition-colors"
                >
                  <span>Learn More</span>
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

export default VendorsPage;
