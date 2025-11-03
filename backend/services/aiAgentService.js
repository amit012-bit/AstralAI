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
    return `You are "Agent," a senior healthcare AI solutions expert for AstralAI.

Primary focus: help users in healthcare identify and evaluate AI solutions from our database that fit their clinical and operational context. Avoid marketing or sales language.

Knowledge sources (internal only):
1) AI Solutions (with department, industry, category, pricing, use cases, company)
2) Company information for vendors

Working principles:
- First, understand intent before recommending. Ask targeted, concise clarifying questions if context is missing (e.g., care setting, data availability, integration constraints, compliance requirements like HIPAA, urgency, budget range).
- Prioritize healthcare use cases (clinical decision support, medical imaging, patient triage, RCM, NLP for clinical notes, care coordination, quality/safety, operations). If the request is not healthcare, politely ask if they want healthcare-focused recommendations or broader options.
- Be precise, neutral, and non-promotional. No hype words. Cite concrete capabilities, data needs, integration touchpoints (EHR/PACS/HIS), and typical implementation considerations.
- When recommending, list 2–5 options max, each with: use case alignment, required data/integration, regulatory considerations, indicative pricing if available, and vendor/company name from our DB.

Response rules:
- ONLY recommend solutions that are in our database. Do not invent.
- If no good matches exist, state that, then ask 2–3 clarifying questions to refine the search or offer to perform an internet search upon explicit user consent.
- Keep answers structured and skimmable. Lead with the user’s objective, then tailored options, then next steps.

Always base answers solely on our database context appended below.`;
  }

  /**
   * Search MongoDB for relevant context based on user message
   */
  async searchContext(userMessage) {
    const searchTerms = this.extractSearchTerms(userMessage);
    const lowerMessage = String(userMessage || '').toLowerCase();
    const isHealthcareIntent = /health|medical|clinic|hospital|clinical|patient|imaging|radiology|pacs|ehr|emr|telemedicine/.test(lowerMessage);
    const imagingKeywords = ['medical imaging','imaging','radiology','x-ray','ct','mri','ultrasound','pacs','dicom','computer vision'];
    const context = {
      solutions: [],
      companies: [],
      queries: [],
      blogs: [],
      users: []
    };

    try {
      // Focus ONLY on solutions - more precise search
      let solutionQuery = {};
      
      // If we have specific keywords, use them for precise matching
      if (searchTerms.solutionKeywords.length > 0 || searchTerms.industryKeywords.length > 0) {
        const keywordRegex = new RegExp((searchTerms.solutionKeywords.join('|') || '.*'), 'i');
        const industryRegex = new RegExp((searchTerms.industryKeywords.join('|') || '.*'), 'i');
        const imagingRegex = new RegExp(imagingKeywords.join('|'), 'i');
        solutionQuery = {
          $and: [
            // If healthcare intent, restrict to healthcare industry
            ...(isHealthcareIntent ? [{ industry: { $regex: /healthcare/i } }] : []),
            {
              $or: [
                { title: { $regex: keywordRegex } },
                { shortDescription: { $regex: keywordRegex } },
                { category: { $regex: keywordRegex } },
                { industry: { $regex: industryRegex } },
                { tags: { $in: searchTerms.solutionKeywords } },
                { useCases: { $regex: keywordRegex } },
                // Imaging-specific boost
                ...(imagingKeywords.some(k => lowerMessage.includes(k)) ? [
                  { category: { $regex: imagingRegex } },
                  { title: { $regex: imagingRegex } },
                  { shortDescription: { $regex: imagingRegex } }
                ] : [])
              ]
            }
          ]
        };
      } else {
        // If no specific keywords found, do a more targeted search with user's words
        const words = userMessage.split(' ').filter(word => word.length > 3);
        if (words.length > 0) {
          const wordRegex = new RegExp(words.join('|'), 'i');
          solutionQuery = {
            $and: [
              ...(isHealthcareIntent ? [{ industry: { $regex: /healthcare/i } }] : []),
              {
                $or: [
                  { title: { $regex: wordRegex } },
                  { shortDescription: { $regex: wordRegex } },
                  { category: { $regex: wordRegex } },
                  { industry: { $regex: wordRegex } }
                ]
              }
            ]
          };
        }
      }
      
      // Get solutions with company information - limit to most relevant ones
      let solutions = await Solution.find(solutionQuery)
        .populate('companyId', 'name website industry')
        .limit(12) // fetch more to score and then cut down
        .lean();

      // Relevance scoring
      const scoreFor = (sol) => {
        let s = 0;
        const text = `${sol.title} ${sol.shortDescription || ''} ${sol.description || ''} ${sol.category} ${(sol.useCases||[]).join(' ')} ${(sol.tags||[]).join(' ')}`.toLowerCase();
        if (isHealthcareIntent) {
          if ((sol.industry || '').toLowerCase().includes('health')) s += 3; else s -= 2;
        }
        // imaging boost if message asks for imaging
        if (imagingKeywords.some(k => lowerMessage.includes(k))) {
          if (/imaging|radiology|pacs|dicom|computer vision/i.test(sol.category || '')) s += 3;
          if (imagingKeywords.some(k => text.includes(k))) s += 2;
        }
        // keyword overlap
        (searchTerms.solutionKeywords || []).forEach(k => { if (k && text.includes(k)) s += 1; });
        return s;
      };

      solutions = solutions
        .map(sol => ({ sol, score: scoreFor(sol) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(({ sol }) => sol);

      // Fallback: if nothing after filter but healthcare intent, show healthcare-only items if available
      if (solutions.length === 0 && isHealthcareIntent) {
        solutions = await Solution.find({ industry: { $regex: /healthcare/i } })
          .populate('companyId', 'name website industry')
          .limit(5)
          .lean();
      }

      context.solutions = solutions;

      // Only get companies that are related to the found solutions
      if (context.solutions.length > 0) {
        const companyIds = context.solutions.map(sol => sol.companyId?._id).filter(Boolean);
        if (companyIds.length > 0) {
          context.companies = await Company.find({ _id: { $in: companyIds } })
            .limit(5)
            .lean();
        }
      }

      // Don't search queries, blogs, or users - focus only on solutions
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
    
      // Solution type keywords - expanded with healthcare and sales terms
      const solutionKeywords = ['chatbot', 'predictive analytics', 'recommendation', 'computer vision',
                               'natural language', 'automation', 'analytics', 'forecasting', 'optimization',
                               'personalization', 'fraud detection', 'image recognition', 'sentiment analysis',
                               'medical imaging', 'diagnosis', 'treatment', 'patient care', 'clinical decision',
                               'health monitoring', 'telemedicine', 'electronic health records', 'ehr',
                               'medical records', 'health data', 'clinical analytics', 'medical ai',
                               'healthcare ai', 'medical chatbot', 'health analytics', 'clinical ai',
                               'sales', 'customer service', 'crm', 'lead generation', 'marketing automation',
                               'sales automation', 'customer engagement', 'sales analytics', 'revenue optimization'];
    
    // Industry keywords - expanded with comprehensive healthcare and sales terms
    const industryKeywords = ['healthcare', 'medical', 'health', 'clinical', 'hospital', 'pharmaceutical',
                             'pharma', 'biotech', 'biotechnology', 'medicine', 'healthcare industry',
                             'medical industry', 'health industry', 'clinical care', 'patient care',
                             'healthcare services', 'medical services', 'health services',
                             'finance', 'e-commerce', 'retail', 'manufacturing', 'education', 'technology', 
                             'marketing', 'sales', 'customer service', 'sales industry', 'business development',
                             'revenue', 'lead generation', 'customer acquisition', 'sales automation'];
    
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
   * Format context for OpenAI prompt - Focus only on solutions
   */
  formatContext(context) {
    let contextText = '';
    
    if (context.solutions.length > 0) {
      contextText += '\n\n**Available AI Solutions in Our Database:**\n';
      context.solutions.forEach((solution, index) => {
        contextText += `${index + 1}. **${solution.title}**\n`;
        contextText += `   - **Department/Category**: ${solution.category}\n`;
        contextText += `   - **Industry**: ${solution.industry}\n`;
        contextText += `   - **Company**: ${solution.companyId?.name || 'Unknown'}\n`;
        contextText += `   - **Description**: ${solution.shortDescription || solution.description}\n`;
        
        if (solution.pricing) {
          contextText += `   - **Pricing**: ${solution.pricing.model}`;
          if (solution.pricing.price?.amount) {
            contextText += ` - $${solution.pricing.price.amount}`;
          }
          contextText += '\n';
        }
        
        if (solution.useCases && solution.useCases.length > 0) {
          contextText += `   - **Use Cases**: ${solution.useCases.join(', ')}\n`;
        }
        
        if (solution.aiTechnology && solution.aiTechnology.length > 0) {
          contextText += `   - **AI Technology**: ${solution.aiTechnology.join(', ')}\n`;
        }
        
        contextText += '\n';
      });
    }
    
    if (context.companies.length > 0) {
      contextText += '\n**Related Companies:**\n';
      context.companies.forEach(company => {
        contextText += `- **${company.name}**: ${company.description}\n`;
        contextText += `  Industry: ${company.industry} | Website: ${company.website}\n\n`;
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
      
      // Search for relevant context in our database
      const context = await this.searchContext(message);
      const contextText = this.formatContext(context);
      
      // Check if we have good matches in our system
      const hasRelevantSolutions = context.solutions.length > 0;
      const hasRelevantCompanies = context.companies.length > 0;
      const hasRelevantQueries = context.queries.length > 0;
      const hasRelevantBlogs = context.blogs.length > 0;
      
      // Determine if we are ready to recommend (intent-first gating)
      const readiness = this.shouldRecommend(message, conversationHistory);

      // Build enhanced system prompt based on search results and readiness
      let enhancedSystemPrompt = this.systemPrompt;
      
      if (!hasRelevantSolutions && !hasRelevantCompanies && !hasRelevantQueries && !hasRelevantBlogs) {
        // No relevant matches found in our system
        enhancedSystemPrompt += `

**IMPORTANT CONTEXT:**
Based on your query, I couldn't find any matching solutions in our current database. 

**SMART RESPONSE STRATEGY:**
1. First, acknowledge that no exact matches were found in our system
2. Ask the user if they would like me to search the internet for broader AI solution suggestions
3. Offer to help them refine their requirements to find better matches in our system
4. Provide general guidance about the type of AI solutions they might be looking for

**RESPONSE TEMPLATE:**
"I searched through our database of AI solutions, but I couldn't find any exact matches for your requirements. 

Would you like me to:
1. Search the internet for broader AI solution suggestions that might help?
2. Help you refine your requirements to find better matches in our system?
3. Provide general guidance about AI solutions in this category?

Let me know which option you'd prefer, and I'll be happy to help!"

**Remember:** Always be helpful and offer multiple options when no system matches are found.`;
      } else if (readiness.isReady) {
        // We have relevant matches and intent appears clear - provide detailed context
        enhancedSystemPrompt += contextText;
      } else {
        // We have matches but user intent is not yet clear. Do NOT bias with full lists.
        enhancedSystemPrompt += `\n\nBefore recommending, first confirm the user's healthcare setting, primary use case, and key constraints. Keep questions concise (max 3).`;
      }
      
      // Build messages array for OpenAI
      const messages = [
        { role: 'system', content: enhancedSystemPrompt }
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
        max_tokens: 1000, // Increased for more detailed responses
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
        },
        searchStatus: {
          hasSystemMatches: hasRelevantSolutions || hasRelevantCompanies || hasRelevantQueries || hasRelevantBlogs,
          needsInternetSearch: !hasRelevantSolutions && !hasRelevantCompanies && !hasRelevantQueries && !hasRelevantBlogs
        },
        // Include solution cards only when intent is sufficiently clear
        solutionCards: readiness.isReady
          ? context.solutions.map(solution => ({
              id: solution._id,
              title: solution.title,
              company: solution.companyId?.name || 'Unknown Company',
              website: solution.companyId?.website || '',
              industry: solution.industry,
              category: solution.category,
              shortDescription: solution.shortDescription || solution.description,
              pricing: solution.pricing?.model || 'Contact for pricing',
              price: solution.pricing?.price?.amount || null,
              logo: solution.companyId?.logo || null,
              isPremium: solution.isPremium || false
            }))
          : []
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
   * Heuristic to decide whether the user's intent is clear enough to recommend solutions
   * We require at least one care setting keyword and one use-case keyword across recent messages
   */
  shouldRecommend(latestMessage, conversationHistory) {
    const recentTexts = [
      ...conversationHistory.slice(-6).map(m => (m && m.content ? String(m.content) : '')),
      String(latestMessage || '')
    ].join(' ').toLowerCase();

    const settingKeywords = [
      'hospital','clinic','telehealth','inpatient','outpatient','radiology','pacs','ehr','emr','epic','cerner','meditech','oncology','cardiology','ed','er','icu'
    ];
    const useCaseKeywords = [
      'imaging','nlp','clinical notes','triage','rcm','revenue cycle','billing','coding','decision support','cds','risk','readmission','scheduling','claims','prior auth','prior authorization','care coordination','patient flow','denials'
    ];
    const constraintKeywords = [
      'hipaa','privacy','security','integration','interoperability','timeline','budget','pilots','compliance'
    ];

    const hasSetting = settingKeywords.some(k => recentTexts.includes(k));
    const hasUseCase = useCaseKeywords.some(k => recentTexts.includes(k));
    const hasConstraint = constraintKeywords.some(k => recentTexts.includes(k));

    const isReady = hasSetting && hasUseCase; // constraints are helpful but not required
    return { isReady, signals: { hasSetting, hasUseCase, hasConstraint } };
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

  /**
   * Handle internet search request when no system matches found
   */
  async handleInternetSearchRequest(message, sessionId = null) {
    try {
      // Get conversation history
      let conversationHistory = this.conversationHistory.get(sessionId) || [];
      
      // Build internet search prompt
      const internetSearchPrompt = `You are "Agent," an intelligent AI assistant for AI SolutionsHub. 

The user has requested internet search for AI solutions because no matches were found in our system database.

**Your task:**
1. Provide comprehensive internet-based AI solution recommendations
2. Include popular, well-known AI tools and platforms
3. Mention specific companies and their solutions
4. Provide pricing information where available
5. Include implementation guidance and best practices
6. Suggest how to evaluate and choose between options

**Response should include:**
- 3-5 specific AI solution recommendations
- Company names and product names
- Brief descriptions of each solution
- Pricing models (free, freemium, subscription, enterprise)
- Use cases and industries they serve
- Implementation complexity and timeline
- How to get started with each solution

**Format your response as:**
1. **Solution Name** (Company)
   - Description: [Brief description]
   - Pricing: [Pricing model]
   - Best for: [Use cases]
   - Get started: [How to begin]

Be helpful, specific, and actionable.`;

      // Build messages array
      const messages = [
        { role: 'system', content: internetSearchPrompt }
      ];
      
      // Add conversation history
      conversationHistory.slice(-10).forEach(msg => {
        messages.push(msg);
      });
      
      // Add current user message
      messages.push({ role: 'user', content: message });
      
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1200, // More tokens for comprehensive internet search results
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      });
      
      const aiResponse = completion.choices[0].message.content;
      
      // Update conversation history
      conversationHistory.push({ role: 'user', content: message });
      conversationHistory.push({ role: 'assistant', content: aiResponse });
      
      this.conversationHistory.set(sessionId, conversationHistory);
      
      return {
        success: true,
        response: aiResponse,
        sessionId: sessionId,
        searchType: 'internet',
        context: {
          solutionsFound: 0,
          companiesFound: 0,
          queriesFound: 0,
          blogsFound: 0
        }
      };
      
    } catch (error) {
      console.error('Error handling internet search request:', error);
      return {
        success: false,
        error: 'Sorry, I encountered an error while searching the internet. Please try again.',
        sessionId: sessionId
      };
    }
  }
}

module.exports = new AIAgentService();
