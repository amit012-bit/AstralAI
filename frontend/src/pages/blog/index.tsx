/**
 * Blog Page - Database-driven Blog Posts
 * Displays blog posts with filtering, search, and pagination
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  EyeIcon,
  HeartIcon,
  TagIcon,
  ArrowRightIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/Layout/Layout';
import AdvancedSearchModal from '@/components/AdvancedSearchModal';

// Sample blog posts (in a real app, this would come from the database)
const BLOG_POSTS = [
  {
    _id: '1',
    title: 'The Future of AI in Healthcare: Trends and Opportunities',
    slug: 'future-of-ai-in-healthcare-trends-and-opportunities',
    excerpt: 'Explore how artificial intelligence is revolutionizing healthcare delivery, from diagnosis to treatment optimization.',
    content: 'Artificial intelligence is transforming healthcare at an unprecedented pace...',
    authorId: '1',
    authorName: 'Dr. Sarah Johnson',
    authorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    category: 'Healthcare AI',
    industry: 'Healthcare',
    tags: ['healthcare', 'ai-trends', 'medical-ai', 'innovation'],
    status: 'published',
    isFeatured: true,
    publishedAt: '2025-01-15T10:00:00Z',
    readTime: 8,
    views: 1250,
    likes: 45,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop'
  },
  {
    _id: '2',
    title: 'Building Effective AI Chatbots: Best Practices and Common Pitfalls',
    slug: 'building-effective-ai-chatbots-best-practices-and-common-pitfalls',
    excerpt: 'Learn the essential strategies for creating AI chatbots that actually work and deliver value to your business.',
    content: 'Creating an effective AI chatbot requires careful planning and execution...',
    authorId: '2',
    authorName: 'John Smith',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    category: 'AI Chatbots',
    industry: 'Technology',
    tags: ['chatbots', 'best-practices', 'customer-service', 'automation'],
    status: 'published',
    isFeatured: true,
    publishedAt: '2025-01-10T14:30:00Z',
    readTime: 6,
    views: 890,
    likes: 32,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop'
  },
  {
    _id: '3',
    title: 'Machine Learning in Finance: Risk Assessment and Fraud Detection',
    slug: 'machine-learning-finance-risk-assessment-fraud-detection',
    excerpt: 'Discover how financial institutions are leveraging ML to improve risk management and detect fraudulent activities.',
    content: 'The financial industry has been at the forefront of adopting machine learning...',
    authorId: '3',
    authorName: 'Michael Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    category: 'Machine Learning',
    industry: 'Finance',
    tags: ['machine-learning', 'finance', 'risk-management', 'fraud-detection'],
    status: 'published',
    isFeatured: false,
    publishedAt: '2025-01-08T09:15:00Z',
    readTime: 10,
    views: 756,
    likes: 28,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop'
  },
  {
    _id: '4',
    title: 'Computer Vision Applications in Manufacturing: Quality Control Revolution',
    slug: 'computer-vision-manufacturing-quality-control-revolution',
    excerpt: 'How computer vision is transforming quality control processes in manufacturing industries.',
    content: 'Manufacturing companies are increasingly turning to computer vision...',
    authorId: '4',
    authorName: 'Emily Davis',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    category: 'Computer Vision',
    industry: 'Manufacturing',
    tags: ['computer-vision', 'manufacturing', 'quality-control', 'automation'],
    status: 'published',
    isFeatured: false,
    publishedAt: '2025-01-05T16:45:00Z',
    readTime: 7,
    views: 634,
    likes: 19,
    image: 'https://images.unsplash.com/photo-1565043589221-1a6fd9e2a937?w=800&h=400&fit=crop'
  },
  {
    _id: '5',
    title: 'Natural Language Processing: Breaking Down Language Barriers in Business',
    slug: 'natural-language-processing-breaking-down-language-barriers-business',
    excerpt: 'Explore how NLP is helping businesses communicate across languages and extract insights from text data.',
    content: 'Natural Language Processing has evolved significantly in recent years...',
    authorId: '5',
    authorName: 'David Wilson',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    category: 'Natural Language Processing',
    industry: 'Technology',
    tags: ['nlp', 'language-processing', 'business', 'communication'],
    status: 'published',
    isFeatured: false,
    publishedAt: '2025-01-03T11:20:00Z',
    readTime: 9,
    views: 567,
    likes: 23,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop'
  },
  {
    _id: '6',
    title: 'AI Ethics in Business: Responsible AI Implementation',
    slug: 'ai-ethics-business-responsible-ai-implementation',
    excerpt: 'Understanding the importance of ethical AI practices and how to implement responsible AI in your organization.',
    content: 'As AI becomes more prevalent in business operations...',
    authorId: '6',
    authorName: 'Lisa Anderson',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    category: 'AI Ethics',
    industry: 'Technology',
    tags: ['ai-ethics', 'responsible-ai', 'business', 'governance'],
    status: 'published',
    isFeatured: false,
    publishedAt: '2025-01-01T08:00:00Z',
    readTime: 12,
    views: 423,
    likes: 31,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop'
  }
];

const CATEGORIES = [
  'All Categories',
  'Healthcare AI',
  'AI Chatbots',
  'Machine Learning',
  'Computer Vision',
  'Natural Language Processing',
  'AI Ethics'
];

const INDUSTRIES = [
  'All Industries',
  'Healthcare',
  'Technology',
  'Finance',
  'Manufacturing',
  'E-commerce',
  'Education'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' }
];

interface FilterState {
  search: string;
  category: string;
  industry: string;
  sort: string;
  viewMode: 'grid' | 'list';
  page: number;
  limit: number;
}

const BlogPage: React.FC = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'All Categories',
    industry: 'All Industries',
    sort: 'newest',
    viewMode: 'grid',
    page: 1,
    limit: 12
  });

  // Filter and sort blog posts
  const filteredPosts = BLOG_POSTS
    .filter(post => {
      if (filters.search && !post.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !post.excerpt.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.category !== 'All Categories' && post.category !== filters.category) {
        return false;
      }
      if (filters.industry !== 'All Industries' && post.industry !== filters.industry) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case 'oldest':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case 'popular':
          return b.views - a.views;
        case 'trending':
          return b.likes - a.likes;
        default:
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
    });

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAdvancedSearch = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'All Categories',
      industry: 'All Industries',
      sort: 'newest',
      viewMode: filters.viewMode
    });
  };

  const handlePostClick = (slug: string) => {
    router.push(`/blog/${slug}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout
      searchValue={filters.search}
      onSearchChange={(value) => handleFilterChange('search', value)}
      onAdvancedSearch={handleAdvancedSearch}
      currentFilters={filters}
      pageType="blog"
    >
      <div className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search Posts
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search blog posts..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Industry Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Industry
                </label>
                <select
                  value={filters.industry}
                  onChange={(e) => handleFilterChange('industry', e.target.value)}
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                >
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
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
            <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-300">
                  Showing <span className="font-medium">{filteredPosts.length}</span> blog posts
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFilterChange('viewMode', 'grid')}
                    className={`p-2 rounded-md ${
                      filters.viewMode === 'grid'
                        ? 'bg-blue-900/30 text-blue-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <FunnelIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleFilterChange('viewMode', 'list')}
                    className={`p-2 rounded-md ${
                      filters.viewMode === 'list'
                        ? 'bg-blue-900/30 text-blue-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <BookOpenIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Post */}
            {filteredPosts.length > 0 && filteredPosts[0].isFeatured && filters.sort === 'newest' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-xl shadow-sm border border-gray-700 overflow-hidden mb-8 cursor-pointer"
                onClick={() => handlePostClick(filteredPosts[0].slug)}
              >
                <div className="relative h-64 md:h-80">
                  <img
                    src={filteredPosts[0].image}
                    alt={filteredPosts[0].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white mb-2">
                      Featured Post
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {filteredPosts[0].title}
                    </h2>
                    <p className="text-gray-200 line-clamp-2">
                      {filteredPosts[0].excerpt}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <img
                          src={filteredPosts[0].authorAvatar}
                          alt={filteredPosts[0].authorName}
                          className="w-6 h-6 rounded-full"
                        />
                        <span>{filteredPosts[0].authorName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDate(filteredPosts[0].publishedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{filteredPosts[0].readTime} min read</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>{filteredPosts[0].views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <HeartIcon className="h-4 w-4" />
                        <span>{filteredPosts[0].likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Blog Posts Grid/List */}
            <AnimatePresence mode="wait">
              {filters.viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {filteredPosts.slice(filteredPosts[0]?.isFeatured && filters.sort === 'newest' ? 1 : 0).map((post, index) => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handlePostClick(post.slug)}
                    >
                      <div className="relative h-48">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                        {post.isFeatured && (
                          <span className="absolute top-3 left-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-600 text-white">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {post.category}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {post.industry}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <img
                                src={post.authorAvatar}
                                alt={post.authorName}
                                className="w-5 h-5 rounded-full"
                              />
                              <span>{post.authorName}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="h-4 w-4" />
                              <span>{post.readTime}m</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <EyeIcon className="h-4 w-4" />
                              <span>{post.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <HeartIcon className="h-4 w-4" />
                              <span>{post.likes}</span>
                            </div>
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
                  className="space-y-6"
                >
                  {filteredPosts.map((post, index) => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handlePostClick(post.slug)}
                    >
                      <div className="flex items-start space-x-6">
                        <div className="flex-shrink-0">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-32 h-32 rounded-lg object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {post.category}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {post.industry}
                            </span>
                            {post.isFeatured && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Featured
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <img
                                  src={post.authorAvatar}
                                  alt={post.authorName}
                                  className="w-5 h-5 rounded-full"
                                />
                                <span>{post.authorName}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <CalendarIcon className="h-4 w-4" />
                                <span>{formatDate(post.publishedAt)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ClockIcon className="h-4 w-4" />
                                <span>{post.readTime} min read</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <EyeIcon className="h-4 w-4" />
                                <span>{post.views} views</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <HeartIcon className="h-4 w-4" />
                                <span>{post.likes} likes</span>
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
            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms to find more posts.
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
      </div>
    </Layout>
  );
};

export default BlogPage;
