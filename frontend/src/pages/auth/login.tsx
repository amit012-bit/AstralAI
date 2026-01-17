/**
 * Login Page Component
 * User authentication login form with validation and error handling
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const redirectTo = (router.query.redirect as string) || '/dashboard';
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router.query.redirect]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, []);

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      clearError();
      
      await login(data.email, data.password);
      
      // Redirect to dashboard or intended page
      const redirectTo = (router.query.redirect as string) || '/dashboard';
      router.push(redirectTo);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('Invalid credentials')) {
        setError('email', { message: 'Invalid email or password' });
        setError('password', { message: 'Invalid email or password' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sign In - AstroVault AI</title>
        <meta name="description" content="Sign in to your AstroVault AI account" />
      </Head>

      <div className="min-h-screen bg-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-6xl mx-auto"
        >
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="flex min-h-[600px]">
              {/* Left Side - Quote and Visual */}
              <div className="hidden lg:flex lg:w-2/3 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-12 flex-col justify-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-lg rotate-12"></div>
                  <div className="absolute top-32 right-16 w-16 h-16 bg-purple-500 rounded-lg -rotate-12"></div>
                  <div className="absolute bottom-20 left-20 w-12 h-12 bg-cyan-500 rounded-lg rotate-45"></div>
                  <div className="absolute bottom-32 right-10 w-14 h-14 bg-pink-500 rounded-lg -rotate-45"></div>
                </div>
                
                <motion.div variants={itemVariants} className="relative z-10">
                  {/* Quote Card */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-bold text-lg">AI</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">AstroVault AI</h3>
                        <p className="text-blue-200 text-sm">AI Solutions Platform</p>
                      </div>
                    </div>
                    
                    <blockquote className="text-2xl font-medium text-white leading-relaxed mb-6">
                      "The development of full artificial intelligence could spell the end of the human race. But it could also be the beginning of a new era of unprecedented progress."
                    </blockquote>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">SH</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">Stephen Hawking</p>
                        <p className="text-gray-300 text-sm">Theoretical Physicist</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quote Navigation Dots */}
                  <div className="flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                  </div>
                </motion.div>
              </div>

              {/* Right Side - Form */}
              <div className="w-full lg:w-1/3 p-8 lg:p-12 flex flex-col justify-center">
                {/* Mobile Logo */}
                <motion.div variants={itemVariants} className="lg:hidden text-center mb-6">
                  <Link href="/" className="inline-flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xl">AI</span>
                    </div>
                    <span className="text-2xl font-bold text-white">AstroVault AI</span>
                  </Link>
                </motion.div>

                {/* Title */}
                <motion.div variants={itemVariants} className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Welcome to AstroVault AI
                  </h2>
                  <p className="text-gray-400">
                    Don't have an account? <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 transition-colors">Click here</Link>
                  </p>
                </motion.div>
                {/* Global Error Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg"
                  >
                    <p className="text-sm text-red-300">{error}</p>
                  </motion.div>
                )}

                {/* Login Form */}
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      type="email"
                      autoComplete="email"
                      className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        {...register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters',
                          },
                        })}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        className={`w-full px-4 py-3 pr-10 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.password ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        {...register('rememberMe')}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
                        Remember me
                      </label>
                    </div>

                    <div className="text-sm">
                      <Link
                        href="/auth/forgot-password"
                        className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div>
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        'Login'
                      )}
                    </motion.button>
                  </div>
                </form>

                {/* Forgot Password Link */}
                <div className="mt-6 text-center">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot your password? Click here
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
