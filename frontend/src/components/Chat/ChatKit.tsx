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
  ChevronDownIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import AIAvatar from './AIAvatar';
import { chatApi, ChatMessage, ChatResponse, SolutionCard } from '@/lib/chatApi';
import { toast } from 'react-hot-toast';
import ParticleRing from '../Background/ParticleRing';
import { useRouter } from 'next/router';

interface ChatKitProps {
  className?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  initialQuery?: string;
}

const ChatKit: React.FC<ChatKitProps> = ({ 
  className = '', 
  isFullscreen = false,
  onToggleFullscreen,
  initialQuery
}) => {
  // Router for navigation
  const router = useRouter();
  
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
        
        // Add welcome message with grid layout
        const welcomeMessage: ChatMessage = {
          role: 'assistant',
          content: `👋 Hello! I'm **Agent**, your AI assistant for AstroVault AI. I can help you discover AI solutions, understand technologies, and connect with verified vendors.`,
          timestamp: new Date().toISOString(),
          showWelcomeGrid: true
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

  // Auto-send initial query if provided (e.g., from home page search)
  // Use a ref to track if we've already sent the initial query
  const hasSentInitialQuery = useRef(false);
  
  useEffect(() => {
    if (initialQuery && initialQuery.trim() && sessionId && messages.length > 0 && !isLoading && !hasSentInitialQuery.current) {
      // Mark that we've sent the query to prevent duplicate sends
      hasSentInitialQuery.current = true;
      
      // Wait a bit for the welcome message to render, then send the query
      const timer = setTimeout(() => {
        const userMessage: ChatMessage = {
          role: 'user',
          content: initialQuery.trim(),
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setIsTyping(true);

        chatApi.sendMessage(initialQuery.trim(), sessionId)
          .then((response: ChatResponse) => {
            if (response.success && response.data) {
              const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: response.data.response,
                timestamp: response.data.timestamp,
                solutionCards: response.data.solutionCards
              };
              
              setMessages(prev => [...prev, assistantMessage]);
              
              if (response.data.context) {
                const { solutionsFound, companiesFound, queriesFound, blogsFound } = response.data.context;
                if (solutionsFound > 0 || companiesFound > 0 || queriesFound > 0 || blogsFound > 0) {
                  toast.success(`Found ${solutionsFound} solutions, ${companiesFound} companies, ${queriesFound} queries, ${blogsFound} articles`);
                }
              }
            }
          })
          .catch((error: any) => {
            console.error('Error sending initial query:', error);
            const errorMessage: ChatMessage = {
              role: 'assistant',
              content: `I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment. 

**Error:** ${error.message}`,
              timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
            toast.error('Failed to get AI response');
          })
          .finally(() => {
            setIsLoading(false);
            setIsTyping(false);
          });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [initialQuery, sessionId, messages.length, isLoading]);

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
          timestamp: response.data.timestamp,
          solutionCards: response.data.solutionCards
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
        content: `👋 Hello! I'm **Agent**, your AI assistant for AstroVault AI. I can help you discover AI solutions, understand technologies, and connect with verified vendors.`,
        timestamp: new Date().toISOString(),
        showWelcomeGrid: true
      };
      
      setMessages([welcomeMessage]);
      toast.success('Conversation cleared');
    } catch (error) {
      console.error('Error clearing conversation:', error);
      toast.error('Failed to clear conversation');
    }
  };

  // Handle internet search request
  const handleInternetSearch = async (message: string) => {
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response: ChatResponse = await chatApi.requestInternetSearch(message, sessionId || undefined);
      
      if (response.success && response.data) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: response.data.timestamp
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        toast.success('Internet search completed');
      } else {
        throw new Error(response.error || 'Failed to perform internet search');
      }
    } catch (error: any) {
      console.error('Error performing internet search:', error);
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `I apologize, but I encountered an error while searching the internet. Please try again. 

**Error:** ${error.message}`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to perform internet search');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Handle solution card click
  const handleSolutionCardClick = (solutionId: string) => {
    router.push(`/solutions/${solutionId}`);
  };

  // Format message timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Welcome Grid Component
  const WelcomeGrid: React.FC = () => (
    <div className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl">
        {/* Example Questions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:bg-black/50 h-full flex flex-col">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <h4 className="text-white font-semibold text-sm bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Example Questions
              </h4>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              {[
                "I need a chatbot for customer service",
                "What AI solutions work best for healthcare?",
                "Show me predictive analytics tools",
                "Help me find vendors in finance"
              ].map((question, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  onClick={() => setInputMessage(question)}
                  className="w-full text-left bg-gradient-to-r from-gray-800/60 to-gray-700/60 hover:from-purple-600/20 hover:to-blue-600/20 text-gray-200 hover:text-white text-xs px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 border border-gray-600/30 hover:border-purple-400/50"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* What Agent Can Do */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative group h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:bg-black/50 h-full flex flex-col">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <h4 className="text-white font-semibold text-sm bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                What Agent Can Do
              </h4>
            </div>
            <div className="space-y-3 flex-1">
              {[
                "Recommend AI solutions based on your needs",
                "Explain AI technologies and applications",
                "Connect you with verified vendors",
                "Provide industry insights and trends"
              ].map((capability, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <SparklesIcon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-gray-300 text-xs leading-relaxed">{capability}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tips for Better Results */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative group h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:bg-black/50 h-full flex flex-col">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <h4 className="text-white font-semibold text-sm bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Tips for Better Results
              </h4>
            </div>
            <div className="space-y-3 flex-1">
              {[
                "Be specific about your industry and use case",
                "Mention your budget and timeline if relevant",
                "Ask follow-up questions for detailed insights",
                "Use the fullscreen mode for longer conversations"
              ].map((tip, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-300 text-xs leading-relaxed">{tip}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Solution Card Component
  const SolutionCard: React.FC<{ solution: SolutionCard }> = ({ solution }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleSolutionCardClick(solution.id)}
      className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300 group h-full flex flex-col relative"
    >
      {/* Premium Badge */}
      {solution.isPremium && (
        <div className="absolute top-2 right-2 z-10 group/tooltip">
          <div className="w-14 h-14 relative">
            {/* Glowing background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-emerald-400/20 to-green-600/20 rounded-full blur-sm animate-pulse"></div>
            {/* Sleek thin border and shadow */}
            <div className="absolute inset-0 rounded-full border border-green-300 shadow-2xl bg-green-50/95"></div>
            <img 
              src="/security.png" 
              alt="Premium Shield" 
              className="w-full h-full object-contain relative z-10 drop-shadow-2xl filter brightness-110"
            />
          </div>
          {/* Hover Tooltip */}
          <div className="absolute right-0 top-full mt-2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg border border-gray-700">
              Trusted Solution by AstroVault AI
              <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45 border-l border-t border-gray-700"></div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
            {solution.title}
          </h4>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <BuildingOfficeIcon className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{solution.company}</span>
          </div>
        </div>
        <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-2" />
      </div>
      
      <p className="text-xs text-gray-600 mb-3 line-clamp-2 flex-1">
        {solution.shortDescription}
      </p>
      
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
            {solution.category}
          </span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
            {solution.industry}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1 text-gray-500">
            <CurrencyDollarIcon className="h-3 w-3" />
            <span>{solution.pricing}</span>
          </div>
          {solution.website && (
            <div className="flex items-center space-x-1 text-blue-600">
              <GlobeAltIcon className="h-3 w-3" />
              <span className="truncate max-w-20">{solution.website}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden ${className}`}>
      {/* ParticleRing Background Animation */}
      <div className="absolute inset-0 z-0">
        <ParticleRing />
      </div>
      
      {/* Content with backdrop blur for better readability */}
      <div className="relative z-10 flex flex-col h-full backdrop-blur-sm bg-white/10">
        {/* AI Agent Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 bg-black/20 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <AIAvatar size="sm" />
            <div>
              <h3 className="text-sm font-semibold text-white">AstroVault AI Agent</h3>
              <p className="text-xs text-gray-300">
                {agentStatus === 'online' ? 'Online' : 
                 agentStatus === 'offline' ? 'Offline' : 'Connecting...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="p-1.5 text-gray-300 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                {isFullscreen ? <XMarkIcon className="h-4 w-4" /> : <ChatBubbleLeftRightIcon className="h-4 w-4" />}
              </button>
            )}
            <button
              onClick={handleClearConversation}
              disabled={isLoading}
              className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
              title="Clear conversation"
            >
              <TrashIcon className="h-4 w-4" />
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
                      : 'bg-gradient-to-br from-purple-600 to-blue-600'
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
                      <div className="text-gray-900">
                        <div className="whitespace-pre-wrap mb-4">
                          {message.content}
                        </div>
                        {message.showWelcomeGrid && index === 0 && <WelcomeGrid />}
                        {message.solutionCards && message.solutionCards.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                              💡 Recommended Solutions:
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl">
                              {message.solutionCards.map((solution, idx) => (
                                <SolutionCard key={idx} solution={solution} />
                              ))}
                            </div>
                          </div>
                        )}
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
