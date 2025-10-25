/**
 * ChatKit Component - Modern AI Agent Interface
 * High-class chat UI with real-time messaging and context awareness
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
import { 
  PaperAirplaneIcon,
  UserIcon, 
  TrashIcon, 
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import AIAvatar from './AIAvatar';
import { chatApi, ChatMessage, ChatResponse } from '@/lib/chatApi';
import { toast } from 'react-hot-toast';
import ParticleRing from '../Background/ParticleRing';

interface ChatKitProps {
  className?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const ChatKit: React.FC<ChatKitProps> = ({ 
  className = '', 
  isFullscreen = false,
  onToggleFullscreen 
}) => {
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'unknown'>('unknown');
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Manual scroll to bottom function (for user-initiated scrolling)
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
  }, []);

  // Handle scroll events to show/hide scroll-to-bottom button
  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold
      setShowScrollButton(!isAtBottom && messages.length > 3);
    }
  }, [messages.length]);

  // Initialize chat session
  useEffect(() => {
    const initializeAIAgent = async () => {
      try {
        // Check AI agent health
        const healthCheck = await chatApi.healthCheck();
        setAgentStatus(healthCheck.success ? 'online' : 'offline');
        
        // Generate new session ID
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);
        
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          role: 'assistant',
          content: `👋 Hello! I'm **Agent**, your AI assistant for AstralAI. I can help you discover AI solutions, understand technologies, and connect with verified vendors. 

**What I can help you with:**
• 🤖 Find AI solutions for your business needs
• 📊 Explain AI technologies and applications  
• 🏢 Connect you with verified AI vendors
• 💡 Provide industry insights and recommendations
• 📈 Help with implementation and pricing

What would you like to explore today?`,
          timestamp: new Date().toISOString()
        };
        
        setMessages([welcomeMessage]);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setAgentStatus('offline');
        toast.error('Failed to initialize AI agent');
      }
    };

    initializeAIAgent();
  }, []);

  // Remove auto-scroll and auto-focus to prevent page jumping
  // Users can manually scroll and click to focus input when needed

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading || !sessionId) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response: ChatResponse = await chatApi.sendMessage(userMessage.content, sessionId);
      
      if (response.success && response.data) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: response.data.timestamp
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Show context info if available
        if (response.data.context) {
          const { solutionsFound, companiesFound, queriesFound, blogsFound } = response.data.context;
          if (solutionsFound > 0 || companiesFound > 0 || queriesFound > 0 || blogsFound > 0) {
            toast.success(`Found ${solutionsFound} solutions, ${companiesFound} companies, ${queriesFound} queries, ${blogsFound} articles`);
          }
        }
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment. 

**Error:** ${error.message}`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Handle clearing conversation
  const handleClearConversation = async () => {
    if (!sessionId || isLoading) return;
    
    try {
      await chatApi.clearConversationHistory(sessionId);
      
      // Reset to welcome message
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: `👋 Hello! I'm **Agent**, your AI assistant for AstralAI. I can help you discover AI solutions, understand technologies, and connect with verified vendors. 

**What I can help you with:**
• 🤖 Find AI solutions for your business needs
• 📊 Explain AI technologies and applications  
• 🏢 Connect you with verified AI vendors
• 💡 Provide industry insights and recommendations
• 📈 Help with implementation and pricing

What would you like to explore today?`,
        timestamp: new Date().toISOString()
      };
      
      setMessages([welcomeMessage]);
      toast.success('Conversation cleared');
    } catch (error) {
      console.error('Error clearing conversation:', error);
      toast.error('Failed to clear conversation');
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Format message timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden ${className}`}>
      {/* ParticleRing Background Animation */}
      <div className="absolute inset-0 z-0">
        <ParticleRing />
      </div>
      
      {/* Content with backdrop blur for better readability */}
      <div className="relative z-10 flex flex-col h-full backdrop-blur-sm bg-white/10">
        {/* AI Agent Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 bg-black/20 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <AIAvatar size="md" />
            <div>
              <h3 className="text-lg font-semibold text-white">AstralAI Agent</h3>
              <p className="text-sm text-gray-300">
                {agentStatus === 'online' ? 'Online' : 
                 agentStatus === 'offline' ? 'Offline' : 'Connecting...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                {isFullscreen ? <XMarkIcon className="h-5 w-5" /> : <ChatBubbleLeftRightIcon className="h-5 w-5" />}
              </button>
            )}
            <button
              onClick={handleClearConversation}
              disabled={isLoading}
              className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
              title="Clear conversation"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Container - Scrollable Chat History */}
        <div 
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500 relative"
        >
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-primary-500' 
                      : 'bg-gradient-to-br from-primary-500 to-accent-500'
                  }`}>
                    {message.role === 'user' ? (
                      <UserIcon className="h-4 w-4 text-white" />
                    ) : (
                      <AIAvatar size="sm" />
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl backdrop-blur-md ${
                    message.role === 'user'
                      ? 'bg-primary-600/80 text-white rounded-br-md border border-primary-500/30'
                      : 'bg-white/90 text-gray-900 border border-white/30 rounded-bl-md shadow-lg'
                  }`}>
                    {message.role === 'assistant' ? (
                      <div className="text-gray-900 whitespace-pre-wrap">
                        {message.content}
                      </div>
                    ) : (
                      <p className="text-white">{message.content}</p>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  <span className="text-xs text-gray-300 mt-1">
                    {formatTimestamp(message.timestamp || new Date().toISOString())}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-center space-x-3">
                <AIAvatar size="sm" />
                <div className="bg-white/90 border border-white/30 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg backdrop-blur-md">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-gray-700 ml-2">Agent is thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        <div ref={messagesEndRef} />
        
        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 p-3 bg-blue-600/80 hover:bg-blue-600 text-white rounded-full shadow-lg backdrop-blur-md border border-blue-500/30 transition-all duration-200 hover:scale-105"
            title="Scroll to bottom"
          >
            <ChevronDownIcon className="w-5 h-5" />
          </motion.button>
        )}
      </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/20 bg-black/20 backdrop-blur-md">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Agent about AI solutions, vendors, or technologies..."
                disabled={isLoading || agentStatus === 'offline'}
                className="w-full px-4 py-3 border border-white/30 rounded-2xl bg-white/90 backdrop-blur-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                maxLength={1000}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                {inputMessage.length}/1000
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading || agentStatus === 'offline'}
              className="p-3 bg-blue-600/80 text-white rounded-2xl hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg backdrop-blur-md border border-blue-500/30"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PaperAirplaneIcon className="h-5 w-5" />
              )}
            </button>
          </form>
          
          {/* Status Message */}
          {agentStatus === 'offline' && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-red-400">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>AI Agent is currently offline. Please try again later.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatKit;
