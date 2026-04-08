const axios = require('axios');

/**
 * Clean and parse JSON from Gemini response
 */
const parseGeminiJson = (text) => {
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
    }
    return JSON.parse(cleanedText);
};

/**
 * Tokenize string for Jaccard similarity fallback
 */
const tokenize = (text) => {
    if (!text) return [];
    return text.toLowerCase()
        .replace(/[^\w\s]/gi, '') // remove punctuation
        .split(/\s+/)
        .filter(word => word.length >= 4); // ignore short words like "the", "a", "and"
};

/**
 * Calculate Jaccard similarity between two arrays of tokens
 */
const jaccardSimilarity = (tokens1, tokens2) => {
    if (tokens1.length === 0 || tokens2.length === 0) return 0;
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return Math.round((intersection.size / union.size) * 100);
};


/**
 * Find similar active complaints using Gemini Flash
 * @param {string} title 
 * @param {string} description 
 * @param {Array} candidates - Array of existing complaint documents to check against
 * @returns {Array} - Matches with similarity >= 80
 */
const findSimilarWithAI = async (title, description, candidates) => {
    if (!candidates || candidates.length === 0) return [];

    // Fallback immediately if no key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        throw new Error('Gemini API key missing');
    }

    const candidateText = candidates.map((c, index) => `
    [Index: ${index}]
    ID: ${c._id}
    Title: ${c.title}
    Description: ${c.description}
    `).join('\n');

    const prompt = `You are a duplicate detection system for a civic complaint platform. 
Compare the NEW COMPLAINT against the list of EXISTING COMPLAINTS.
Determine if the new complaint is describing the exact same physical issue at the same location as any of the existing ones.

NEW COMPLAINT:
Title: ${title}
Description: ${description}

EXISTING COMPLAINTS:
${candidateText}

Task:
For each existing complaint, calculate a similarity score from 0 to 100.
100 = Exact same issue (e.g. same pothole, same broken pipe).
0 = Completely unrelated.

Return ONLY a JSON array of objects. Do not include markdown formatting or other text.
Format: [{"index": <number>, "similarity": <number>, "reason": "<short string>"}]
Only include matches with similarity >= 80. If none, return an empty array [].
`;

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1, // Low temp for more deterministic evaluation
                    responseMimeType: "application/json",
                }
            },
            { timeout: 5000 } // 5 second timeout to ensure snappy UX
        );

        const text = response.data.candidates[0].content.parts[0].text;
        const results = parseGeminiJson(text);

        if (!Array.isArray(results)) return [];

        return results
            .filter(r => r.similarity >= 80)
            .map(r => ({
                complaint: candidates[r.index],
                similarity: r.similarity,
                reason: r.reason
            }));

    } catch (error) {
        throw error; // Throw so the caller can trigger the fallback
    }
};

/**
 * Fallback keyword matching if AI fails or times out
 */
const findSimilarWithKeywords = (title, description, candidates) => {
    if (!candidates || candidates.length === 0) return [];

    const newTokens = tokenize(`${title} ${description}`);

    const results = candidates.map(c => {
        const candidateTokens = tokenize(`${c.title} ${c.description}`);
        const similarity = jaccardSimilarity(newTokens, candidateTokens);
        return {
            complaint: c,
            similarity,
            reason: 'Keyword overlap (fallback mechanism)'
        };
    });

    // Lower threshold for keywords since they are less precise
    return results
        .filter(r => r.similarity >= 40) // 40% Jaccard is usually a solid overlap for short civic texts
        .sort((a, b) => b.similarity - a.similarity);
};

module.exports = {
    findSimilarWithAI,
    findSimilarWithKeywords
};