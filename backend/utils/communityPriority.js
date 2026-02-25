/**
 * Community Priority Scoring Algorithm
 * 
 * Calculates a dynamic priority score for complaints based on 4 factors:
 * 1. Upvote count (logarithmic scaling to prevent runaway viral scores)
 * 2. AI-assessed urgency level
 * 3. Time decay (newer complaints rank higher, decays via log)
 * 4. Sentiment analysis (more negative = more urgency)
 */

const WEIGHTS = {
    upvotes: 2,
    urgency: 3,
    timeFactor: 1.5,
    sentiment: 2,
};

const URGENCY_MAP = {
    'Critical': 1.0,
    'High': 0.75,
    'Medium': 0.5,
    'Low': 0.25,
};

// Maps actual sentiment enum values from the Complaint schema
const SENTIMENT_MAP = {
    'Urgent': 1.0,
    'Angry': 0.9,
    'Frustrated': 0.75,
    'Concerned': 0.5,
    'Neutral': 0.25,
};

/**
 * Calculate community priority score for a complaint
 * @param {Object} complaint - Mongoose complaint document
 * @returns {{ score: number, lastCalculated: Date }}
 */
const calculateCommunityPriority = (complaint) => {
    // 1. Logarithmic upvote scaling — prevents runaway scores from viral complaints
    const upvoteCount = complaint.upvotes?.count || 0;
    const upvoteScore = Math.log2(upvoteCount + 1);

    // 2. Urgency from AI analysis (field: aiSummary.extractedInfo.urgency)
    const urgency = complaint.aiSummary?.extractedInfo?.urgency || 'Medium';
    const urgencyScore = URGENCY_MAP[urgency] || 0.5;

    // 3. Time decay — newer complaints score higher, decay slows via log
    const ageInHours = (Date.now() - new Date(complaint.createdAt)) / (1000 * 60 * 60);
    const timeScore = 1 / (1 + Math.log10(ageInHours + 1));

    // 4. Sentiment from AI analysis (field: aiSummary.sentiment)
    const sentiment = complaint.aiSummary?.sentiment || 'Neutral';
    const sentimentScore = SENTIMENT_MAP[sentiment] || 0.25;

    const score =
        (upvoteScore * WEIGHTS.upvotes) +
        (urgencyScore * WEIGHTS.urgency) +
        (timeScore * WEIGHTS.timeFactor) +
        (sentimentScore * WEIGHTS.sentiment);

    return {
        score: Math.round(score * 100) / 100,
        lastCalculated: new Date(),
    };
};

module.exports = { calculateCommunityPriority };
