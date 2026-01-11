/**
 * About Page - Company Information and Mission
 * Displays information about AstralAI and its mission
 */

import { motion } from 'framer-motion';
import { 
  SparklesIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  CheckIcon,
  StarIcon,
  GlobeAltIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Layout from '@/components/Layout/Layout';
import Footer from '@/components/Layout/Footer';

// Team members data
const TEAM_MEMBERS = [
  {
    name: 'Dr. Sarah Johnson',
    role: 'CEO & Founder',
    bio: 'AI researcher with 15+ years of experience in machine learning and healthcare technology.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    linkedin: '#'
  },
  {
    name: 'John Smith',
    role: 'CTO',
    bio: 'Former Google engineer specializing in scalable AI systems and cloud infrastructure.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    linkedin: '#'
  },
  {
    name: 'Emily Davis',
    role: 'Head of Product',
    bio: 'Product strategist with expertise in AI product development and user experience design.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
    linkedin: '#'
  },
  {
    name: 'Michael Chen',
    role: 'Head of Engineering',
    bio: 'Full-stack engineer passionate about building robust AI platforms and developer tools.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    linkedin: '#'
  }
];

// Company stats
const STATS = [
  { number: '500+', label: 'AI Solutions' },
  { number: '1,200+', label: 'Happy Customers' },
  { number: '50+', label: 'Verified Vendors' },
  { number: '99.9%', label: 'Uptime Guarantee' }
];

// Values data
const VALUES = [
  {
    icon: LightBulbIcon,
    title: 'Innovation',
    description: 'We constantly push the boundaries of what\'s possible with AI technology.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Trust & Security',
    description: 'Your data security and privacy are our top priorities in everything we do.'
  },
  {
    icon: UserGroupIcon,
    title: 'Community',
    description: 'We foster a collaborative environment where vendors and customers thrive together.'
  },
  {
    icon: RocketLaunchIcon,
    title: 'Excellence',
    description: 'We strive for excellence in every solution we curate and every service we provide.'
  }
];

// Features data
const FEATURES = [
  {
    icon: SparklesIcon,
    title: 'Curated AI Solutions',
    description: 'Every solution is carefully vetted by our team of AI experts to ensure quality and reliability.'
  },
  {
    icon: ChartBarIcon,
    title: 'Data-Driven Matching',
    description: 'Our advanced algorithms match customers with the perfect AI solutions for their needs.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Verified Vendors',
    description: 'All vendors undergo a thorough verification process to ensure credibility and quality.'
  },
  {
    icon: UserGroupIcon,
    title: 'Expert Support',
    description: 'Our team of AI specialists provides guidance and support throughout your journey.'
  }
];

const AboutPage: React.FC = () => {
  return (
    <Layout>
      <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                About AstralAI
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto mb-8">
                We're revolutionizing how businesses discover, evaluate, and implement AI solutions. 
                Our mission is to democratize access to cutting-edge AI technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/solutions">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center space-x-2 bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
                  >
                    <span>Explore Solutions</span>
                    <SparklesIcon className="h-5 w-5" />
                  </motion.button>
                </Link>
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center space-x-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-700 transition-colors"
                  >
                    <span>Get in Touch</span>
                    <UserGroupIcon className="h-5 w-5" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                At AstralAI, we believe that artificial intelligence has the power to transform 
                businesses and solve complex challenges. However, finding the right AI solution can be 
                overwhelming with thousands of options available.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We've created a comprehensive platform that connects businesses with verified AI vendors, 
                making it easy to discover, evaluate, and implement the perfect AI solution for your specific needs.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckIcon className="h-6 w-6 text-green-500" />
                  <span className="text-gray-700 font-medium">Verified AI solution vendors</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckIcon className="h-6 w-6 text-green-500" />
                  <span className="text-gray-700 font-medium">Intelligent matching algorithms</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckIcon className="h-6 w-6 text-green-500" />
                  <span className="text-gray-700 font-medium">Expert guidance and support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckIcon className="h-6 w-6 text-green-500" />
                  <span className="text-gray-700 font-medium">Secure and transparent platform</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  {STATS.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="text-center"
                    >
                      <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                        {stat.number}
                      </div>
                      <div className="text-gray-600 font-medium">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AstralAI?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide everything you need to find, evaluate, and implement the perfect AI solution for your business.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 border border-blue-100">
                  <feature.icon className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do and shape our commitment to our community.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our diverse team of AI experts, engineers, and business strategists work together 
              to make AI accessible to everyone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM_MEMBERS.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center"
              >
                <div className="relative mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <StarIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  {member.bio}
                </p>
                <a
                  href={member.linkedin}
                  className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <GlobeAltIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">LinkedIn</span>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of companies already using our platform to find and implement AI solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
                >
                  <span>Get Started Today</span>
                  <RocketLaunchIcon className="h-5 w-5" />
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-700 transition-colors"
                >
                  <span>Contact Us</span>
                  <HeartIcon className="h-5 w-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </Layout>
  );
};

export default AboutPage;
