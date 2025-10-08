const axios = require('axios');

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

    const prompt = `You are an AI assistant for an Indian Municipal Corporation complaint management system.
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

Respond only with valid JSON:`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    const text = response.data.candidates[0].content.parts[0].text;

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
 * Get department ID by category
 */
exports.getDepartmentByCategory = async (category) => {
  try {
    const Department = require('../models/Department');

    // Category to department name mapping (matches actual department names in DB)
    const categoryToDepartment = {
      'Roads': 'Road Maintenance',
      'Water Supply': 'Water Supply',
      'Sanitation': 'Sanitation',
      'Electricity': 'Street Lighting',
      'Public Health': 'Health & Hygiene',
      'Street Lights': 'Street Lighting',
      'Drainage': 'Water Supply',
      'Garbage': 'Sanitation',
      'Other': null
    };

    const departmentName = categoryToDepartment[category];
    if (!departmentName) return null;

    // Find department by name
    const department = await Department.findOne({ name: departmentName });
    return department ? department._id : null;
  } catch (error) {
    console.error('Error mapping category to department:', error.message);
    return null;
  }
};

/**
 * Generate AI summary for complaint
 * @param {string} title - Complaint title
 * @param {string} description - Complaint description
 * @param {string} location - Complaint location
 * @param {string} category - Complaint category
 * @returns {Object} - AI-generated summary with key points and extracted info
 */
exports.summarizeComplaint = async (title, description, location, category) => {
  try {
    // If no API key, return null (complaint will still work)
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.warn('Gemini API key not configured, skipping AI summarization');
      return null;
    }

    const prompt = `You are an AI assistant for a municipal complaint management system.
Analyze the following complaint and provide a concise summary:

Title: ${title}
Description: ${description}
Location: ${location}
Category: ${category}

Provide a JSON response with:
1. "shortSummary" - A single clear sentence (max 150 characters) summarizing the main issue
2. "keyPoints" - Array of 3-5 bullet points highlighting the most important details
3. "mainIssue" - The core problem in 2-3 words (e.g., "Broken street light", "Water leakage")
4. "urgency" - Urgency level: "Low", "Medium", "High", or "Critical"
5. "sentiment" - Citizen's tone: "Neutral", "Concerned", "Frustrated", "Angry", or "Urgent"
6. "affectedArea" - Estimated scope: "Single location", "Street", "Neighborhood", "Multiple areas"

Focus on:
- Extracting factual information
- Identifying safety or health concerns
- Detecting urgency indicators
- Understanding citizen frustration level

Respond only with valid JSON.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    const text = response.data.candidates[0].content.parts[0].text;

    // Clean the response (remove markdown code blocks if present)
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    try {
      const parsedResponse = JSON.parse(cleanedText);

      return {
        shortSummary: parsedResponse.shortSummary || `${category} issue at ${location}`,
        keyPoints: parsedResponse.keyPoints || [
          `Location: ${location}`,
          `Category: ${category}`,
          `Issue: ${title}`
        ],
        extractedInfo: {
          mainIssue: parsedResponse.mainIssue || category,
          location: location,
          urgency: parsedResponse.urgency || 'Medium',
          affectedArea: parsedResponse.affectedArea || 'Single location',
        },
        sentiment: parsedResponse.sentiment || 'Neutral',
        generatedAt: new Date(),
      };
    } catch (parseError) {
      console.error('Failed to parse AI summary response:', parseError);
      // Return basic fallback summary
      return {
        shortSummary: `${category} issue reported at ${location}`,
        keyPoints: [
          `Location: ${location}`,
          `Category: ${category}`,
          `Issue: ${title}`
        ],
        extractedInfo: {
          mainIssue: category,
          location: location,
          urgency: 'Medium',
          affectedArea: 'Single location',
        },
        sentiment: 'Neutral',
        generatedAt: new Date(),
      };
    }

  } catch (error) {
    console.error('AI Summarization Error:', error.message);
    // Return null - complaint will still work without summary
    return null;
  }
};