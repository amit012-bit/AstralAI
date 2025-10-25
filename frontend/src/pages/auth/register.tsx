/**
 * Register Page Component
 * User registration form with role selection and validation
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'customer' | 'vendor';
  phone?: string;
  industry?: string;
  agreeToTerms: boolean;
}

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { register: registerUser, isAuthenticated, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    defaultValues: {
      role: 'customer',
    },
  });

  const password = watch('password');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router.query.redirect]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, []);

  // Handle form submission
  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      clearError();

      // Prepare registration data
      const registrationData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone,
        industry: data.industry,
      };

      await registerUser(registrationData);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('already exists')) {
        setError('email', { message: 'An account with this email already exists' });
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
        <title>Create Account - AstralAI</title>
        <meta name="description" content="Create your AstralAI account and start discovering AI solutions" />
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
                        <h3 className="text-xl font-bold text-white">AstralAI</h3>
                        <p className="text-blue-200 text-sm">AI Solutions Platform</p>
                      </div>
                    </div>
                    
                    <blockquote className="text-2xl font-medium text-white leading-relaxed mb-6">
                      "Artificial intelligence is the future, and the future is here. It's not about replacing humans, but about augmenting human capabilities and creating new possibilities."
                    </blockquote>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">EK</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">Elon Musk</p>
                        <p className="text-gray-300 text-sm">CEO, Tesla & SpaceX</p>
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
                    <span className="text-2xl font-bold text-white">AstralAI</span>
                  </Link>
                </motion.div>

                {/* Title */}
                <motion.div variants={itemVariants} className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Create your account
                  </h2>
                  <p className="text-gray-400">
                    Already have an account? <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors">Click here</Link>
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

                {/* Registration Form */}
                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">I am a</label>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative flex items-center justify-center px-3 py-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                          watch('role') === 'customer'
                            ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                            : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <input
                          {...register('role')}
                          type="radio"
                          value="customer"
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">Customer</span>
                          <span className="text-xs text-gray-400">Find solutions</span>
                        </div>
                        {watch('role') === 'customer' && (
                          <CheckIcon className="absolute top-1 right-1 h-3 w-3 text-blue-400" />
                        )}
                      </motion.label>

                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative flex items-center justify-center px-3 py-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                          watch('role') === 'vendor'
                            ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                            : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <input
                          {...register('role')}
                          type="radio"
                          value="vendor"
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">Vendor</span>
                          <span className="text-xs text-gray-400">Offer solutions</span>
                        </div>
                        {watch('role') === 'vendor' && (
                          <CheckIcon className="absolute top-1 right-1 h-3 w-3 text-blue-400" />
                        )}
                      </motion.label>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                        First name
                      </label>
                      <input
                        {...register('firstName', {
                          required: 'First name is required',
                          minLength: {
                            value: 2,
                            message: 'First name must be at least 2 characters',
                          },
                        })}
                        type="text"
                        autoComplete="given-name"
                        className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.firstName ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="John"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                        Last name
                      </label>
                      <input
                        {...register('lastName', {
                          required: 'Last name is required',
                          minLength: {
                            value: 2,
                            message: 'Last name must be at least 2 characters',
                          },
                        })}
                        type="text"
                        autoComplete="family-name"
                        className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.lastName ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="Doe"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email address
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
                      className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="john@company.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone and Industry Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                        Phone <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        {...register('phone', {
                          pattern: {
                            value: /^[\+]?[1-9][\d]{0,15}$/,
                            message: 'Invalid phone number',
                          },
                        })}
                        type="tel"
                        autoComplete="tel"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-1">
                        Industry <span className="text-gray-400">(optional)</span>
                      </label>
                      <select
                        {...register('industry')}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select industry</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="ecommerce">E-commerce</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="education">Education</option>
                        <option value="real-estate">Real Estate</option>
                        <option value="transportation">Transportation</option>
                        <option value="energy">Energy</option>
                        <option value="technology">Technology</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
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
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                              message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
                            },
                          })}
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          className={`w-full px-3 py-2 pr-10 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.password ? 'border-red-500' : 'border-gray-600'
                          }`}
                          placeholder="Create a strong password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                        Confirm password
                      </label>
                      <div className="relative">
                        <input
                          {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) =>
                              value === password || 'Passwords do not match',
                          })}
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          className={`w-full px-3 py-2 pr-10 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                          }`}
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        {...register('agreeToTerms', {
                          required: 'You must agree to the terms and conditions',
                        })}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="agreeToTerms" className="text-gray-300">
                        I agree to the{' '}
                        <Link
                          href="/terms"
                          className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        >
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link
                          href="/privacy"
                          className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        >
                          Privacy Policy
                        </Link>
                      </label>
                      {errors.agreeToTerms && (
                        <p className="mt-1 text-xs text-red-400">{errors.agreeToTerms.message}</p>
                      )}
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
                          <span>Creating account...</span>
                        </div>
                      ) : (
                        'Create account'
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default RegisterPage;
