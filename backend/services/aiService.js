const { GoogleGenAI } = require('@google/genai');
const { CATEGORIES } = require('../../shared/constants');

// Initialize the Google GenAI client once (reused across calls)
let genai = null;

const getGenAI = () => {
  if (!genai && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genai;
};

/**
 * Classify complaint and determine priority using Gemini AI
 */
exports.classifyComplaint = async (title, description, category) => {
  try {
    const client = getGenAI();
    if (!client) {
      return getFallbackClassification(category);
    }

    const validCategories = CATEGORIES.join(', ');

    const prompt = `You are an expert complaint classifier for an Indian Municipal Corporation.

TASK: Classify this civic complaint and assign a priority level.

COMPLAINT:
- Title: "${title}"
- Description: "${description}"
- Citizen-selected Category: "${category}"

INSTRUCTIONS:
1. Pick the BEST category from EXACTLY this list: [${validCategories}]
   - If the citizen's choice is accurate, keep it.
   - Only override if the description clearly belongs to a different category.
2. Assign priority based on these rules:
   - "High": Immediate public safety risk, health hazard, affects many people, infrastructure collapse, sewage overflow, exposed electrical wires, contaminated water supply
   - "Medium": Significant inconvenience but no immediate danger — potholes, broken street lights, irregular garbage collection, minor drainage issues
   - "Low": Cosmetic issues, minor complaints, informational requests, single-location problems with low urgency
3. Provide a confidence score (0-100) and a 1-sentence reasoning.

Respond with a JSON object containing these exact keys:
{
  "category": "<one of the valid categories>",
  "priority": "<High|Medium|Low>",
  "confidence": <number 0-100>,
  "reasoning": "<1 sentence explaining classification>"
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text;

    try {
      // Clean the response (remove markdown code blocks if present)
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }

      const parsedResponse = JSON.parse(cleanedText);

      // Validate category is in allowed list
      const validCategory = CATEGORIES.includes(parsedResponse.category)
        ? parsedResponse.category
        : category; // Fall back to user's choice if AI returns invalid category

      // Validate priority
      const validPriority = ['High', 'Medium', 'Low'].includes(parsedResponse.priority)
        ? parsedResponse.priority
        : 'Medium';

      return {
        category: validCategory,
        department: null,
        priority: validPriority,
        confidence: Math.min(100, Math.max(0, parsedResponse.confidence || 75)),
        reasoning: parsedResponse.reasoning || 'AI classification',
        aiClassified: true
      };
    } catch (parseError) {
      console.error('[AI Classify] Parse error:', parseError.message);
      return getFallbackClassification(category);
    }

  } catch (error) {
    console.error('[AI Classify] API error:', error.message);
    return getFallbackClassification(category);
  }
};

/**
 * Fallback classification when AI is not available
 */
const getFallbackClassification = (category) => {
  const categoryMapping = {
    'Roads': { priority: 'Medium' },
    'Water Supply': { priority: 'High' },
    'Sanitation': { priority: 'High' },
    'Electricity': { priority: 'Medium' },
    'Public Health': { priority: 'High' },
    'Street Lights': { priority: 'Low' },
    'Drainage': { priority: 'High' },
    'Garbage': { priority: 'Medium' },
    'Other': { priority: 'Medium' }
  };

  const mapping = categoryMapping[category] || { priority: 'Medium' };

  return {
    category: category,
    department: null,
    priority: mapping.priority,
    confidence: 60,
    reasoning: 'Rule-based classification (AI unavailable)',
    aiClassified: false
  };
};

/**
 * Get department ID by category — queries DB so admins control routing without code changes.
 * 
 * Strategy (ordered by priority):
 * 1. Exact match: Department.categories array includes the complaint category
 * 2. Fuzzy match: Department name contains the category keyword (e.g., "Water Supply" → "Water Supply Department")
 * 3. Null: No matching department — complaint goes to "Pending Assignment"
 */
exports.getDepartmentByCategory = async (category) => {
  try {
    const Department = require('../models/Department');
    
    // Strategy 1: Exact category match (admin-configured)
    const exactMatch = await Department.findOne({ categories: category }).select('_id name');
    if (exactMatch) {
      console.log(`[Dept Routing] "${category}" → "${exactMatch.name}" (exact category match)`);
      return exactMatch._id;
    }

    // Strategy 2: Fuzzy match on department name
    // "Water Supply" complaint → matches "Water Supply Department" or "Water & Sanitation"
    const words = category.split(/\s+/).filter(w => w.length > 2); // skip short words like "of", "and"
    if (words.length > 0) {
      const regexPattern = words.map(w => `(?=.*${w})`).join('');
      const fuzzyMatch = await Department.findOne({
        name: { $regex: regexPattern, $options: 'i' }
      }).select('_id name');
      
      if (fuzzyMatch) {
        console.log(`[Dept Routing] "${category}" → "${fuzzyMatch.name}" (fuzzy name match)`);
        return fuzzyMatch._id;
      }
    }

    // Strategy 3: No match found
    console.warn(`[Dept Routing] No department found for category "${category}". Admin should assign categories to departments in Department Management.`);
    return null;
  } catch (error) {
    console.error('[Department Lookup] Failed:', error.message);
    return null;
  }
};

/**
 * Generate AI summary for complaint
 */
exports.summarizeComplaint = async (title, description, location, category) => {
  try {
    const client = getGenAI();
    if (!client) {
      return null;
    }

    const prompt = `You are an AI assistant for an Indian municipal complaint management system.
Summarize this civic complaint concisely for staff review.

Complaint:
- Title: "${title}"
- Description: "${description}"
- Location: "${location}"
- Category: "${category}"

Respond with a JSON object:
{
  "shortSummary": "<single clear sentence, max 150 chars, summarizing the main issue>",
  "keyPoints": ["<point 1>", "<point 2>", "<point 3>"],
  "mainIssue": "<core problem in 2-3 words>",
  "urgency": "<Low|Medium|High|Critical>",
  "sentiment": "<Neutral|Concerned|Frustrated|Angry|Urgent>",
  "affectedArea": "<Single location|Street|Neighborhood|Multiple areas>"
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const text = response.text;

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
      console.error('[AI Summary] Parse error:', parseError.message);
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
    console.error('[AI Summary] API error:', error.message);
    return null;
  }
};