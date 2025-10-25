/**
 * AI Agent Service - Context-Aware AI Assistant
 * Integrates OpenAI GPT-4o Mini with MongoDB context search
 */

const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');

// Import MongoDB models for context search
const Solution = require('../models/Solution');
const Company = require('../models/Company');
const Query = require('../models/Query');
const Blog = require('../models/Blog');
const User = require('../models/User');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIAgentService {
  constructor() {
    this.systemPrompt = this.buildSystemPrompt();
    this.conversationHistory = new Map(); // Store conversation history per session
  }

  /**
   * Build the system prompt with context about the AI SolutionsHub
   */
  buildSystemPrompt() {
    return `You are "Agent," an intelligent AI assistant for AI SolutionsHub, a comprehensive marketplace for AI solutions. 

Your role is to help users discover, understand, and connect with AI solutions that match their business needs. You have access to real-time information about:

1. **AI Solutions**: Various AI products and services available on the platform
2. **Companies**: Verified AI vendors and solution providers  
3. **Customer Queries**: Real requirements and challenges from businesses
4. **Industry Insights**: Latest trends and best practices in AI
5. **Blog Content**: Expert articles and technical guides

**Key Capabilities:**
- Recommend AI solutions based on specific business requirements
- Explain AI technologies and their applications
- Help users understand pricing models and implementation timelines
- Connect users with relevant vendors and solutions
- Provide industry-specific AI insights and recommendations
- Answer questions about AI trends, technologies, and best practices

**Response Guidelines:**
- Be helpful, accurate, and professional
- Provide specific, actionable recommendations
- Reference real solutions and companies when relevant
- Ask clarifying questions when needed
- Keep responses concise but comprehensive
- Always prioritize user needs and business value

**Important:** Always base your responses on the context provided from our database. If you don't have specific information about something, say so and offer to help in other ways.

Remember: You're here to make AI accessible and help businesses succeed with AI solutions.`;
  }

  /**
   * Search MongoDB for relevant context based on user message
   */
  async searchContext(userMessage) {
    const searchTerms = this.extractSearchTerms(userMessage);
    const context = {
      solutions: [],
      companies: [],
      queries: [],
      blogs: [],
      users: []
    };

    try {
      // Search solutions
      if (searchTerms.solutionKeywords.length > 0) {
        const solutionQuery = {
          $or: [
            { title: { $regex: searchTerms.solutionKeywords.join('|'), $options: 'i' } },
            { description: { $regex: searchTerms.solutionKeywords.join('|'), $options: 'i' } },
            { category: { $regex: searchTerms.solutionKeywords.join('|'), $options: 'i' } },
            { tags: { $in: searchTerms.solutionKeywords } },
            { industry: { $regex: searchTerms.industryKeywords.join('|'), $options: 'i' } }
          ]
        };
        
        context.solutions = await Solution.find(solutionQuery)
          .populate('companyId', 'name website industry')
          .limit(5)
          .lean();
      }

      // Search companies
      if (searchTerms.companyKeywords.length > 0) {
        const companyQuery = {
          $or: [
            { name: { $regex: searchTerms.companyKeywords.join('|'), $options: 'i' } },
            { description: { $regex: searchTerms.companyKeywords.join('|'), $options: 'i' } },
            { industry: { $regex: searchTerms.industryKeywords.join('|'), $options: 'i' } },
            { categories: { $in: searchTerms.solutionKeywords } }
          ]
        };
        
        context.companies = await Company.find(companyQuery)
          .limit(3)
          .lean();
      }

      // Search customer queries
      if (searchTerms.queryKeywords.length > 0) {
        const queryQuery = {
          $or: [
            { title: { $regex: searchTerms.queryKeywords.join('|'), $options: 'i' } },
            { description: { $regex: searchTerms.queryKeywords.join('|'), $options: 'i' } },
            { category: { $regex: searchTerms.solutionKeywords.join('|'), $options: 'i' } },
            { industry: { $regex: searchTerms.industryKeywords.join('|'), $options: 'i' } },
            { tags: { $in: searchTerms.queryKeywords } }
          ]
        };
        
        context.queries = await Query.find(queryQuery)
          .populate('customerId', 'firstName lastName industry')
          .limit(3)
          .lean();
      }

      // Search blog posts
      if (searchTerms.blogKeywords.length > 0) {
        const blogQuery = {
          $or: [
            { title: { $regex: searchTerms.blogKeywords.join('|'), $options: 'i' } },
            { excerpt: { $regex: searchTerms.blogKeywords.join('|'), $options: 'i' } },
            { category: { $regex: searchTerms.solutionKeywords.join('|'), $options: 'i' } },
            { tags: { $in: searchTerms.blogKeywords } }
          ]
        };
        
        context.blogs = await Blog.find(blogQuery)
          .limit(2)
          .lean();
      }

      return context;
    } catch (error) {
      console.error('Error searching context:', error);
      return context;
    }
  }

  /**
   * Extract relevant search terms from user message
   */
  extractSearchTerms(message) {
    const lowerMessage = message.toLowerCase();
    
    // AI/Technology keywords
    const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 
                       'neural network', 'nlp', 'computer vision', 'chatbot', 'automation'];
    
    // Solution type keywords
    const solutionKeywords = ['chatbot', 'predictive analytics', 'recommendation', 'computer vision',
                             'natural language', 'automation', 'analytics', 'forecasting', 'optimization',
                             'personalization', 'fraud detection', 'image recognition', 'sentiment analysis'];
    
    // Industry keywords
    const industryKeywords = ['healthcare', 'finance', 'e-commerce', 'retail', 'manufacturing',
                             'education', 'technology', 'marketing', 'sales', 'customer service'];
    
    // Company keywords
    const companyKeywords = ['vendor', 'company', 'provider', 'solution provider', 'ai company'];
    
    // Query keywords
    const queryKeywords = ['need', 'looking for', 'requirement', 'challenge', 'problem', 'help',
                          'solution for', 'implement', 'deploy', 'integrate'];
    
    // Blog keywords
    const blogKeywords = ['trend', 'best practice', 'guide', 'tutorial', 'article', 'blog',
                         'insight', 'expert', 'analysis', 'comparison'];
    
    const found = {
      solutionKeywords: solutionKeywords.filter(keyword => lowerMessage.includes(keyword)),
      industryKeywords: industryKeywords.filter(keyword => lowerMessage.includes(keyword)),
      companyKeywords: companyKeywords.filter(keyword => lowerMessage.includes(keyword)),
      queryKeywords: queryKeywords.filter(keyword => lowerMessage.includes(keyword)),
      blogKeywords: blogKeywords.filter(keyword => lowerMessage.includes(keyword)),
      aiKeywords: aiKeywords.filter(keyword => lowerMessage.includes(keyword))
    };
    
    // If no specific keywords found, extract general terms
    if (Object.values(found).every(arr => arr.length === 0)) {
      const words = message.split(' ').filter(word => word.length > 3);
      found.solutionKeywords = words.slice(0, 3);
    }
    
    return found;
  }

  /**
   * Format context for OpenAI prompt
   */
  formatContext(context) {
    let contextText = '';
    
    if (context.solutions.length > 0) {
      contextText += '\n\n**Available AI Solutions:**\n';
      context.solutions.forEach(solution => {
        contextText += `- **${solution.title}** (${solution.category}): ${solution.shortDescription || solution.description}\n`;
        contextText += `  Company: ${solution.companyId?.name || 'Unknown'}\n`;
        contextText += `  Industry: ${solution.industry}\n`;
        if (solution.pricing) {
          contextText += `  Pricing: ${solution.pricing.model} - ${solution.pricing.price?.amount || 'Contact for pricing'}\n`;
        }
        contextText += '\n';
      });
    }
    
    if (context.companies.length > 0) {
      contextText += '\n**Verified AI Companies:**\n';
      context.companies.forEach(company => {
        contextText += `- **${company.name}**: ${company.description}\n`;
        contextText += `  Industry: ${company.industry} | Size: ${company.companySize}\n`;
        contextText += `  Website: ${company.website}\n\n`;
      });
    }
    
    if (context.queries.length > 0) {
      contextText += '\n**Similar Customer Requirements:**\n';
      context.queries.forEach(query => {
        contextText += `- **${query.title}**: ${query.description}\n`;
        contextText += `  Industry: ${query.industry} | Category: ${query.category}\n`;
        if (query.requirements?.budget) {
          contextText += `  Budget: $${query.requirements.budget.min} - $${query.requirements.budget.max}\n`;
        }
        contextText += '\n';
      });
    }
    
    if (context.blogs.length > 0) {
      contextText += '\n**Relevant Articles:**\n';
      context.blogs.forEach(blog => {
        contextText += `- **${blog.title}**: ${blog.excerpt}\n`;
        contextText += `  Category: ${blog.category} | Author: ${blog.authorName}\n\n`;
      });
    }
    
    return contextText;
  }

  /**
   * Process user message and generate AI response
   */
  async processMessage(message, sessionId = null) {
    try {
      // Get or create conversation history
      if (!sessionId) {
        sessionId = uuidv4();
      }
      
      let conversationHistory = this.conversationHistory.get(sessionId) || [];
      
      // Search for relevant context
      const context = await this.searchContext(message);
      const contextText = this.formatContext(context);
      
      // Build messages array for OpenAI
      const messages = [
        { role: 'system', content: this.systemPrompt + contextText }
      ];
      
      // Add conversation history (last 10 messages to keep context manageable)
      conversationHistory.slice(-10).forEach(msg => {
        messages.push(msg);
      });
      
      // Add current user message
      messages.push({ role: 'user', content: message });
      
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      });
      
      const aiResponse = completion.choices[0].message.content;
      
      // Update conversation history
      conversationHistory.push({ role: 'user', content: message });
      conversationHistory.push({ role: 'assistant', content: aiResponse });
      
      // Keep only last 20 messages to manage memory
      if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
      }
      
      this.conversationHistory.set(sessionId, conversationHistory);
      
      return {
        success: true,
        response: aiResponse,
        sessionId: sessionId,
        context: {
          solutionsFound: context.solutions.length,
          companiesFound: context.companies.length,
          queriesFound: context.queries.length,
          blogsFound: context.blogs.length
        }
      };
      
    } catch (error) {
      console.error('Error processing AI message:', error);
      
      return {
        success: false,
        error: 'Sorry, I encountered an error processing your request. Please try again.',
        sessionId: sessionId
      };
    }
  }

  /**
   * Get conversation history for a session
   */
  getConversationHistory(sessionId) {
    return this.conversationHistory.get(sessionId) || [];
  }

  /**
   * Clear conversation history for a session
   */
  clearConversationHistory(sessionId) {
    this.conversationHistory.delete(sessionId);
    return { success: true, message: 'Conversation history cleared' };
  }

  /**
   * Get AI agent statistics
   */
  getStats() {
    return {
      activeSessions: this.conversationHistory.size,
      totalMessages: Array.from(this.conversationHistory.values())
        .reduce((total, history) => total + history.length, 0)
    };
  }
}

module.exports = new AIAgentService();
