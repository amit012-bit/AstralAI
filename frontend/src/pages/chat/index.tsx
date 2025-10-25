/**
 * AI Agent Page - AI Agent Interface
 * Dedicated page for interacting with the AI agent
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { 
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import ChatKit from '@/components/Chat/ChatKit';
import AIAvatar from '@/components/Chat/AIAvatar';
import Layout from '@/components/Layout/Layout';

const ChatPage: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Layout title="AstralAI Agent" 
    // subtitle="Get personalized AI solution recommendations, expert insights, and instant answers to your questions about AI technologies and vendors."
    >
      <Head>
        <title>AI Agent - AstralAI</title>
        <meta name="description" content="Interact with our AI agent to discover solutions, get recommendations, and find the perfect AI tools for your business." />
      </Head>

      <div className="bg-gray-800 min-h-screen">

        {/* AI Agent Interface */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`${
              isFullscreen 
                ? 'fixed inset-0 z-50 bg-gray-900' 
                : 'bg-gray-900 rounded-xl shadow-lg border border-gray-700'
            }`}
          >
            {isFullscreen && (
              <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
                <div className="flex items-center space-x-3">
                  <AIAvatar size="sm" />
                  <h2 className="text-lg font-semibold text-white">AI Agent - Fullscreen Interface</h2>
                </div>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            )}
            
            <div className={isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[600px]'}>
              <ChatKit 
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
              />
            </div>
          </motion.div>

          {/* Help Section */}
          {!isFullscreen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Example Questions */}
              <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Example Questions</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-300 bg-gray-800 p-3 rounded-lg">
                    "I need a chatbot for customer service"
                  </div>
                  <div className="text-sm text-gray-300 bg-gray-800 p-3 rounded-lg">
                    "What AI solutions work best for healthcare?"
                  </div>
                  <div className="text-sm text-gray-300 bg-gray-800 p-3 rounded-lg">
                    "Show me predictive analytics tools"
                  </div>
                  <div className="text-sm text-gray-300 bg-gray-800 p-3 rounded-lg">
                    "Help me find vendors in the finance industry"
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">What Agent Can Do</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <SparklesIcon className="h-4 w-4 text-blue-400 mt-0.5" />
                    <span className="text-sm text-gray-300">Recommend AI solutions based on your needs</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <SparklesIcon className="h-4 w-4 text-blue-400 mt-0.5" />
                    <span className="text-sm text-gray-300">Explain AI technologies and applications</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <SparklesIcon className="h-4 w-4 text-blue-400 mt-0.5" />
                    <span className="text-sm text-gray-300">Connect you with verified vendors</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <SparklesIcon className="h-4 w-4 text-blue-400 mt-0.5" />
                    <span className="text-sm text-gray-300">Provide industry insights and trends</span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Tips for Better Results</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <span className="text-sm text-gray-300">Be specific about your industry and use case</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <span className="text-sm text-gray-300">Mention your budget and timeline if relevant</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <span className="text-sm text-gray-300">Ask follow-up questions for detailed insights</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <span className="text-sm text-gray-300">Use the fullscreen mode for longer conversations</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
