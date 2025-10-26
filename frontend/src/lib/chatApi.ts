/**
 * Chat API Service - AI Agent Integration
 * Handles communication with the AI agent backend
 */

import api from './api';

export interface SolutionCard {
  id: string;
  title: string;
  company: string;
  website: string;
  industry: string;
  category: string;
  shortDescription: string;
  pricing: string;
  price?: number;
  logo?: string;
  isPremium?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  solutionCards?: SolutionCard[];
  showWelcomeGrid?: boolean;
}

export interface ChatResponse {
  success: boolean;
  data?: {
    response: string;
    sessionId: string;
    context: {
      solutionsFound: number;
      companiesFound: number;
      queriesFound: number;
      blogsFound: number;
    };
    timestamp: string;
    solutionCards?: SolutionCard[];
  };
  error?: string;
}

export interface ConversationHistory {
  success: boolean;
  data?: {
    sessionId: string;
    history: ChatMessage[];
    messageCount: number;
  };
  error?: string;
}

class ChatApi {
  private baseUrl = '/chat';

  /**
   * Send message to AI agent
   */
  async sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/message`, {
        message: message.trim(),
        sessionId: sessionId
      });

      return response.data;
    } catch (error: any) {
      console.error('Error sending message:', error);
      throw new Error(error.response?.data?.error || 'Failed to send message');
    }
  }

  /**
   * Get conversation history for a session
   */
  async getConversationHistory(sessionId: string): Promise<ConversationHistory> {
    try {
      const response = await api.get(`${this.baseUrl}/history/${sessionId}`);

      return response.data;
    } catch (error: any) {
      console.error('Error fetching conversation history:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch conversation history');
    }
  }

  /**
   * Clear conversation history for a session
   */
  async clearConversationHistory(sessionId: string): Promise<{ success: boolean; data: any }> {
    try {
      const response = await api.delete(`${this.baseUrl}/history/${sessionId}`);

      return response.data;
    } catch (error: any) {
      console.error('Error clearing conversation history:', error);
      throw new Error(error.response?.data?.error || 'Failed to clear conversation history');
    }
  }

  /**
   * Get AI agent statistics
   */
  async getAgentStats(): Promise<{ success: boolean; data: any }> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`);

      return response.data;
    } catch (error: any) {
      console.error('Error fetching agent stats:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch agent statistics');
    }
  }

  /**
   * Health check for AI agent service
   */
  async healthCheck(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/health`);

      return response.data;
    } catch (error: any) {
      console.error('Error checking AI agent health:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'AI agent service unavailable'
      };
    }
  }

  /**
   * Request internet search when no system matches found
   */
  async requestInternetSearch(message: string, sessionId?: string): Promise<ChatResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/internet-search`, {
        message: message.trim(),
        sessionId: sessionId
      });

      return response.data;
    } catch (error: any) {
      console.error('Error requesting internet search:', error);
      throw new Error(error.response?.data?.error || 'Failed to perform internet search');
    }
  }
}

export const chatApi = new ChatApi();
