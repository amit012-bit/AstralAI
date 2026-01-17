/**
 * AI Agent Page - AI Agent Interface
 * Dedicated page for interacting with the AI agent
 */

import React, { useState } from 'react';
import { useRouter } from 'next/router';
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
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const initialQuery = router.query.q as string | undefined;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Layout title="AstroVault AI Agent" 
    // subtitle="Get personalized AI solution recommendations, expert insights, and instant answers to your questions about AI technologies and vendors."
    >
      <Head>
        <title>AI Agent - AstroVault AI</title>
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
            
            <div className={isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[700px]'}>
              <ChatKit 
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
                initialQuery={initialQuery}
              />
            </div>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
