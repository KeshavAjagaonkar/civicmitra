const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Classify complaint and determine priority using Gemini AI
 * @param {string} title - Complaint title
 * @param {string} description - Complaint description
 * @param {string} category - User-selected category
 * @returns {Object} - { category, department, priority, confidence }
 */
exports.classifyComplaint = async (title, description, category) => {
  try {
    // If no API key is provided, fallback to basic classification
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.warn('Gemini API key not configured, using fallback classification');
      return getFallbackClassification(category);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
    You are an AI assistant for an Indian Municipal Corporation complaint management system. 
    Analyze the following complaint and provide classification details:

    Title: ${title}
    Description: ${description}
    User-selected Category: ${category}

    Based on this information, provide a JSON response with:
    1. "category" - The most appropriate category from: [Roads, Water Supply, Sanitation, Electricity, Public Health, Street Lights, Drainage, Garbage, Other]
    2. "department" - The responsible department ID (use null for now, will be mapped later)
    3. "priority" - Priority level: High/Medium/Low based on urgency and public impact
    4. "confidence" - Your confidence level (0-100) in this classification
    5. "reasoning" - Brief explanation of your classification

    Consider factors like:
    - Public safety impact (higher priority)
    - Number of people affected
    - Urgency indicated in the description
    - Infrastructure criticality

    Respond only with valid JSON:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const parsedResponse = JSON.parse(text);
      
      // Validate the response
      if (parsedResponse.category && parsedResponse.priority) {
        return {
          category: parsedResponse.category,
          department: null, // Will be mapped to actual department ID later
          priority: parsedResponse.priority,
          confidence: parsedResponse.confidence || 75,
          reasoning: parsedResponse.reasoning || 'AI classification',
          aiClassified: true
        };
      } else {
        throw new Error('Invalid AI response format');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return getFallbackClassification(category);
    }

  } catch (error) {
    console.error('AI Classification Error:', error.message);
    // Fallback to rule-based classification
    return getFallbackClassification(category);
  }
};

/**
 * Fallback classification when AI is not available
 */
const getFallbackClassification = (category) => {
  const categoryMapping = {
    'Roads': { priority: 'Medium', department: null },
    'Water Supply': { priority: 'High', department: null },
    'Sanitation': { priority: 'High', department: null },
    'Electricity': { priority: 'Medium', department: null },
    'Public Health': { priority: 'High', department: null },
    'Street Lights': { priority: 'Low', department: null },
    'Drainage': { priority: 'High', department: null },
    'Garbage': { priority: 'Medium', department: null },
    'Other': { priority: 'Medium', department: null }
  };

  const mapping = categoryMapping[category] || { priority: 'Medium', department: null };
  
  return {
    category: category,
    department: mapping.department,
    priority: mapping.priority,
    confidence: 60,
    reasoning: 'Rule-based classification (fallback)',
    aiClassified: false
  };
};

/**
 * Get department ID by category (to be implemented with actual department data)
 */
exports.getDepartmentByCategory = async (category) => {
  // This should query the Department model to get the actual department ID
  // For now, returning null - will be implemented when testing department assignment
  return null;
};