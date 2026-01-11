/**
 * Floating AI Agent Button - Quick Access to AI Agent
 * Provides easy access to the chat interface from any page
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon
} from '@heroicons/react/24/outline';
import ChatKit from './ChatKit';
import AIAvatar from './AIAvatar';
import ChatIcon from './ChatIcon';

const FloatingChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAIAgent = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating AI Agent Button */}
      <motion.div
        className="fixed top-6 right-6 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 200 }}
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleAIAgent}
          className="w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center relative group border-2 border-white/20 backdrop-blur-sm"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <XMarkIcon className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChatIcon size="md" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notification badge */}
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </motion.div>

          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/30 to-blue-400/30 blur-md -z-10"></div>

          {/* Pulse animation when closed */}
          {!isOpen && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/40 to-blue-500/40"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.1, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          {/* Tooltip */}
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            {isOpen ? 'Close AI Agent' : 'Open AI Agent'}
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </motion.button>
      </motion.div>

      {/* AI Agent Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-30"
              onClick={toggleAIAgent}
            />
            
            {/* AI Agent Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-24 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 z-40 overflow-hidden"
            >
              <ChatKit />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatButton;
