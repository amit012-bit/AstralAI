/**
 * Proposal Chat Hub Component
 * Collaboration workspace for customers and vendors to finalize proposals
 * Features: Contextual chat, file sharing (SOW, data samples), mark as fulfilled
 */

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  DocumentIcon,
  LinkIcon,
  CheckCircleIcon,
  UserIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'vendor';
  message: string;
  attachments?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
  createdAt: string;
}

interface ProposalChatHubProps {
  proposalId: string;
  proposalTitle: string;
  proposedSolutionTitle?: string;
  vendorName?: string;
  customerName?: string;
  onClose?: () => void;
  onFulfilled?: () => void;
}

export const ProposalChatHub: React.FC<ProposalChatHubProps> = ({
  proposalId,
  proposalTitle,
  proposedSolutionTitle,
  vendorName,
  customerName,
  onClose,
  onFulfilled
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [fulfilling, setFulfilling] = useState(false);
  const [hiring, setHiring] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [milestoneType, setMilestoneType] = useState<string>('');

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat messages (would be from API in real implementation)
  useEffect(() => {
    loadMessages();
  }, [proposalId]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      // TODO: Fetch messages from API
      // const response = await proposalsApi.getChatMessages(proposalId);
      // setMessages(response.messages || []);
      
      // Mock data for now
      setMessages([
        {
          _id: '1',
          senderId: user?._id || '',
          senderName: customerName || 'Customer',
          senderRole: 'customer',
          message: 'Hello! I\'m interested in learning more about your solution.',
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load chat messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    setSending(true);
    try {
      // TODO: Send message via API
      // const response = await proposalsApi.sendChatMessage(proposalId, {
      //   message: newMessage.trim(),
      //   attachments: selectedFiles
      // });

      // Add message to local state
      const message: ChatMessage = {
        _id: Date.now().toString(),
        senderId: user?._id || '',
        senderName: user ? `${user.firstName} ${user.lastName}` : 'You',
        senderRole: (user?.role === 'customer' ? 'customer' : 'vendor') as 'customer' | 'vendor',
        message: newMessage.trim(),
        attachments: selectedFiles.map((file, idx) => ({
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file)
        })),
        createdAt: new Date().toISOString()
      };

      setMessages([...messages, message]);
      setNewMessage('');
      setSelectedFiles([]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles([...selectedFiles, ...files]);
    e.target.value = ''; // Reset input
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleMarkHired = async () => {
    if (!confirm('Mark this vendor as hired? This will notify the admin to verify the connection.')) return;

    setHiring(true);
    try {
      // TODO: Update proposal status via API and notify admin
      // await proposalsApi.markAsHired(proposalId, responseId);
      toast.success('Vendor marked as hired! Admin will verify the connection.');
      if (onFulfilled) {
        onFulfilled();
      }
    } catch (error: any) {
      console.error('Error marking as hired:', error);
      toast.error('Failed to mark vendor as hired');
    } finally {
      setHiring(false);
    }
  };

  const handleMarkFulfilled = async () => {
    if (!confirm('Mark this proposal as fulfilled? This will close the conversation.')) return;

    setFulfilling(true);
    try {
      // TODO: Update proposal status via API
      // await proposalsApi.updateProposal(proposalId, { status: 'fulfilled' });
      toast.success('Proposal marked as fulfilled!');
      if (onFulfilled) {
        onFulfilled();
      }
      if (onClose) {
        onClose();
      }
    } catch (error: any) {
      console.error('Error marking as fulfilled:', error);
      toast.error('Failed to mark proposal as fulfilled');
    } finally {
      setFulfilling(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const isCustomer = user?.role === 'customer';

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Context Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 border-b border-blue-800">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="w-5 h-5" />
              <h2 className="text-lg font-bold">Collaboration Hub</h2>
            </div>
            <div className="space-y-1 text-sm text-blue-100">
              <div>
                <span className="font-medium">Need:</span> {proposalTitle}
              </div>
              {proposedSolutionTitle && (
                <div>
                  <span className="font-medium">Proposed Solution:</span> {proposedSolutionTitle}
                </div>
              )}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.senderRole === (user?.role === 'customer' ? 'customer' : 'vendor') ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl ${
                    message.senderRole === (user?.role === 'customer' ? 'customer' : 'vendor')
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  } rounded-lg p-4 shadow-sm`}
                >
                  {/* Message Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className={`w-4 h-4 ${message.senderRole === (user?.role === 'customer' ? 'customer' : 'vendor') ? 'text-blue-100' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${message.senderRole === (user?.role === 'customer' ? 'customer' : 'vendor') ? 'text-blue-100' : 'text-gray-600'}`}>
                      {message.senderName}
                    </span>
                    <span className={`text-xs ${message.senderRole === (user?.role === 'customer' ? 'customer' : 'vendor') ? 'text-blue-200' : 'text-gray-500'}`}>
                      {formatTime(message.createdAt)}
                    </span>
                  </div>

                  {/* Message Content */}
                  <p className="whitespace-pre-wrap mb-2">{message.message}</p>

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-opacity-20">
                      {message.attachments.map((attachment, idx) => (
                        <a
                          key={idx}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 text-sm ${
                            message.senderRole === (user?.role === 'customer' ? 'customer' : 'vendor')
                              ? 'text-blue-100 hover:text-white'
                              : 'text-blue-600 hover:text-blue-800'
                          }`}
                        >
                          <DocumentIcon className="w-4 h-4" />
                          {attachment.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        </div>

        {/* Context Lock Sidebar - Mini-Profile */}
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-l border-gray-200 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Context</h3>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Need/Posting Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Need</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">{proposalTitle}</h5>
                  <p className="text-xs text-blue-700">Customer requirement for AI solution</p>
                </div>
              </div>

              {/* Proposed Solution */}
              {proposedSolutionTitle && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Proposed Solution</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-semibold text-green-900 mb-2">{proposedSolutionTitle}</h5>
                    {vendorName && (
                      <p className="text-xs text-green-700">by {vendorName}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Milestone Sharing */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Milestones</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Share milestone documents (POC, SOW, etc.)</p>
                  {/* Milestone files would be listed here */}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sidebar Toggle Button */}
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            className="absolute right-4 top-20 p-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            title="Show Context"
          >
            <UserIcon className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* File Preview */}
      {selectedFiles.length > 0 && (
        <div className="px-6 py-3 bg-gray-100 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
              >
                <DocumentIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="text-red-600 hover:text-red-800"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                rows={3}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
                />
                <label
                  htmlFor="file-upload"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                  title="Attach file"
                >
                  <PaperClipIcon className="w-5 h-5" />
                </label>
              </div>
              
              {/* Milestone Upload for Vendors */}
              {user?.role === 'vendor' && (
                <div className="relative">
                  <input
                    type="file"
                    id="milestone-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Set milestone type before uploading
                        const type = prompt('Milestone type (e.g., POC, SOW, Technical Documentation):');
                        if (type) {
                          setMilestoneType(type);
                          handleFileSelect(e);
                        }
                      }
                      e.target.value = '';
                    }}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                  />
                  <label
                    htmlFor="milestone-upload"
                    className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-100 rounded-md cursor-pointer transition-colors"
                    title="Upload Milestone (POC, SOW, etc.)"
                  >
                    <SparklesIcon className="w-5 h-5" />
                  </label>
                </div>
              )}
              <button
                type="submit"
                disabled={sending || (!newMessage.trim() && selectedFiles.length === 0)}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>

        {/* Action Buttons - Only for customers */}
        {isCustomer && (
          <div className="px-4 pb-4 border-t border-gray-200 pt-4 space-y-3">
            <button
              onClick={handleMarkHired}
              disabled={hiring}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <CheckCircleIcon className="w-5 h-5" />
              {hiring ? 'Marking as Hired...' : 'Mark as Hired'}
            </button>
            <button
              onClick={handleMarkFulfilled}
              disabled={fulfilling}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-md hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircleIcon className="w-4 h-4" />
              {fulfilling ? 'Marking...' : 'Mark as Fulfilled'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Fix import
const ChatBubbleLeftRightIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
