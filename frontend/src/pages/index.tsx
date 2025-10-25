/**
 * Home Page Component - MeetStream.ai Inspired Design
 * Modern landing page with advanced animations and glass morphism effects
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout/Layout';
import Footer from '@/components/Layout/Footer';
import { useFeaturedSolutions } from '@/hooks/useSolutions';
import { 
  ArrowRightIcon, 
  SparklesIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  StarIcon,
  EyeIcon,
  HeartIcon,
  CurrencyDollarIcon,
  CpuChipIcon,
  GlobeAltIcon,
  BoltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Dynamically import ParticleRing to avoid SSR issues with Three.js
const ParticleRing = dynamic(
  () => import('@/components/Background/ParticleRing'),
  { ssr: false }
);

const HomePage: React.FC = () => {
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedSolutions(6);
  const featuredSolutions = featuredData?.solutions || [];
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  // Mouse tracking for parallax effect
  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const staggerItem = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <Head>
        <title>AstralAI - Explore the Edge of Intelligence</title>
        <meta name="description" content="AstralAI: Unified platform for AI solutions - discover, compare, and implement cutting-edge AI technologies for your business." />
      </Head>
        {/* Hero Section - MeetStream.ai Style with 3D Particle Ring */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {/* 3D Particle Ring Background */}
          <div className="absolute inset-0 opacity-40">
            <ParticleRing />
          </div>

          {/* Animated Background Elements - Overlay on top of 3D background */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Floating orbs */}
            <motion.div
              className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-xl opacity-10"
              animate={{
                x: mousePosition.x * 0.01,
                y: mousePosition.y * 0.01,
              }}
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
            />
            <motion.div
              className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-xl opacity-10"
              animate={{
                x: mousePosition.x * -0.01,
                y: mousePosition.y * 0.01,
              }}
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
            />
            <motion.div
              className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-screen filter blur-xl opacity-10"
              animate={{
                x: mousePosition.x * 0.005,
                y: mousePosition.y * -0.01,
              }}
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
            />

            {/* Grid pattern overlay */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            ></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="space-y-8"
            >
              {/* Main Heading */}
              <motion.div variants={staggerItem} className="space-y-6">
                <motion.h1 
                  className="text-5xl md:text-7xl font-bold text-white leading-tight"
                  variants={fadeInUp}
                >
                  <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                    Connect. Discover. Deploy.
                  </span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
                  variants={fadeInUp}
                >
                  AI vendors meet decision-makers — all in one place.
                </motion.p>
                
                <motion.p 
                  className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mt-4"
                  variants={fadeInUp}
                >
                  (Astral + AI — starry, visionary AI hub)
                </motion.p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                variants={staggerItem}
                className="flex justify-center items-center"
              >
                <Link href="/solutions">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <SparklesIcon className="w-6 h-6" />
                      Browse Solutions
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </motion.button>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                variants={staggerItem}
                className="flex flex-wrap justify-center items-center gap-8 pt-8 text-gray-400"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5" />
                  <span className="text-sm">Enterprise Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <BoltIcon className="w-5 h-5" />
                  <span className="text-sm">Real-time Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <GlobeAltIcon className="w-5 h-5" />
                  <span className="text-sm">Global Availability</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <motion.div
                className="w-1 h-3 bg-white rounded-full mt-2"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2 
                variants={staggerItem}
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              >
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Unified Platform
                </span>
                <br />
                for AI Solutions
              </motion.h2>
              
              <motion.p 
                variants={staggerItem}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                AstralAI provides a single platform for AI solutions - discover, compare, and implement cutting-edge AI technologies for your business.
              </motion.p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: CpuChipIcon,
                  title: "AI Solution Discovery",
                  description: "Browse and discover cutting-edge AI solutions with intelligent matching and personalized recommendations.",
                  color: "from-purple-500 to-pink-500"
                },
                {
                  icon: UserGroupIcon,
                  title: "Multi-Platform Support",
                  description: "Seamlessly integrate with various AI platforms using a single interface—no need to juggle multiple integrations.",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: ChartBarIcon,
                  title: "Performance Analytics",
                  description: "Track and analyze AI solution performance with comprehensive dashboards and real-time insights.",
                  color: "from-green-500 to-emerald-500"
                },
                {
                  icon: ShieldCheckIcon,
                  title: "Enterprise Security",
                  description: "Protect sensitive data with enterprise-grade security, compliance, and secure cloud infrastructure.",
                  color: "from-red-500 to-orange-500"
                },
                {
                  icon: LightBulbIcon,
                  title: "Smart Recommendations",
                  description: "Get intelligent recommendations based on your business needs, industry, and existing infrastructure.",
                  color: "from-yellow-500 to-amber-500"
                },
                {
                  icon: RocketLaunchIcon,
                  title: "Developer-First Design",
                  description: "Access robust APIs with clean documentation—empowering developers to build and customize fast.",
                  color: "from-indigo-500 to-purple-500"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Featured Solutions Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2 
                variants={staggerItem}
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              >
                Featured AI Solutions
              </motion.h2>
              
              <motion.p 
                variants={staggerItem}
                className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
              >
                Discover the most popular and innovative AI solutions trusted by businesses worldwide.
              </motion.p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {featuredSolutions.slice(0, 6).map((solution: any, index: number) => (
                <motion.div
                  key={solution._id}
                  variants={staggerItem}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Solution Image/Icon */}
                  <div className="h-48 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <CpuChipIcon className="w-16 h-16 text-white" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {solution.title}
                      </h3>
                      {solution.isVerified && (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      )}
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {solution.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {solution.tags?.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-900">
                          {solution.averageRating?.toFixed(1) || '4.5'}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({solution.reviewCount || 0} reviews)
                        </span>
                      </div>
                      
                      <Link href={`/solutions/${solution._id}`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                        >
                          View Details
                        </motion.button>
                      </Link>
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-center mt-12"
            >
              <Link href="/solutions">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-2 mx-auto"
                >
                  Browse All Solutions
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute top-0 left-0 w-full h-full opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            ></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.h2 
                variants={staggerItem}
                className="text-4xl md:text-5xl font-bold text-white"
              >
                Ready to Transform Your Business
                <br />
                <span className="bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
                  with AI Solutions?
                </span>
              </motion.h2>
              
              <motion.p 
                variants={staggerItem}
                className="text-xl text-gray-300 max-w-2xl mx-auto"
              >
                Join thousands of businesses already using AstralAI to discover, implement, and scale their AI initiatives.
              </motion.p>

              <motion.div 
                variants={staggerItem}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
              >
                <Link href="/auth/register">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white text-purple-900 rounded-full font-semibold text-lg shadow-2xl hover:shadow-white/25 transition-all duration-300 flex items-center gap-2"
                  >
                    <RocketLaunchIcon className="w-6 h-6" />
                    Get Started Free
                  </motion.button>
                </Link>

                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border-2 border-white/20 text-white rounded-full font-semibold text-lg backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                  >
                    Contact Sales
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* Footer */}
        <Footer />
    </Layout>
  );
};

export default HomePage;