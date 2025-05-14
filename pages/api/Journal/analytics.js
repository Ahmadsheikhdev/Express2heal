import dbConnect from "../../../lib/dbConnect";
import JournalEntry from "../../../models/JournalEntry";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

// Simple sentiment analysis function
// In a production app, you might want to use a more sophisticated NLP service
function analyzeSentiment(text) {
  try {
    // List of positive and negative words for basic sentiment analysis
    const positiveWords = ['happy', 'great', 'excellent', 'good', 'positive', 'wonderful', 'amazing', 'love', 'joy', 'excited', 'grateful', 'thankful', 'blessed', 'hopeful', 'optimistic', 'peaceful', 'calm', 'relaxed', 'confident', 'proud'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'negative', 'horrible', 'hate', 'angry', 'upset', 'disappointed', 'frustrated', 'annoyed', 'worried', 'anxious', 'stressed', 'depressed', 'unhappy', 'miserable', 'uncomfortable', 'afraid'];
    
    // Convert to lowercase for case-insensitive matching
    const lowerText = text.toLowerCase();
    
    // Count occurrences of positive and negative words
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      const regex = new RegExp('\\b' + word + '\\b', 'g');
      const matches = lowerText.match(regex);
      if (matches) {
        positiveCount += matches.length;
      }
    });
    
    negativeWords.forEach(word => {
      const regex = new RegExp('\\b' + word + '\\b', 'g');
      const matches = lowerText.match(regex);
      if (matches) {
        negativeCount += matches.length;
      }
    });
    
    // Calculate sentiment score between -1 and 1
    const totalWords = lowerText.split(/\s+/).length;
    let sentimentScore = 0;
    
    if (totalWords > 0) {
      sentimentScore = (positiveCount - negativeCount) / Math.sqrt(totalWords);
      // Normalize to range between -1 and 1
      sentimentScore = Math.max(-1, Math.min(1, sentimentScore));
    }
    
    return sentimentScore;
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    // Return neutral sentiment if analysis fails
    return 0;
  }
}

// Get date ranges based on timeframe
function getDateRange(timeframe) {
  const now = new Date();
  let startDate = new Date();
  
  switch (timeframe) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(now.getMonth() - 1); // Default to month
  }
  
  return { startDate, endDate: now };
}

// Format date for display
function formatDate(date, timeframe) {
  try {
    const options = { 
      day: 'numeric',
      month: timeframe === 'year' ? 'short' : 'numeric',
      year: timeframe === 'year' ? 'numeric' : undefined
    };
    
    return new Date(date).toLocaleDateString('en-US', options);
  } catch (error) {
    console.error("Error formatting date:", error);
    // Return fallback date format if formatting fails
    return new Date(date).toISOString().split('T')[0];
  }
}

// Generate insights based on journal data
function generateInsights(journalData) {
  try {
    const insights = [];
    
    // Sentiment trend insight
    if (journalData.sentimentTrend.length > 1) {
      const firstSentiment = journalData.sentimentTrend[0].score;
      const lastSentiment = journalData.sentimentTrend[journalData.sentimentTrend.length - 1].score;
      const sentimentDiff = lastSentiment - firstSentiment;
      
      if (sentimentDiff > 0.3) {
        insights.push("Your emotional state has been improving significantly over this period. Keep up the positive momentum!");
      } else if (sentimentDiff < -0.3) {
        insights.push("Your emotional state has been declining recently. Consider focusing on self-care activities that have helped you in the past.");
      } else if (Math.abs(sentimentDiff) <= 0.1) {
        insights.push("Your emotional state has remained relatively stable during this period.");
      }
    }
    
    // Mood insight
    if (journalData.mostCommonMood) {
      const mood = journalData.mostCommonMood.toLowerCase();
      if (['happy', 'excited', 'confident', 'grateful', 'relaxed'].includes(mood)) {
        insights.push(`You've been feeling ${mood} most frequently. This positive emotional pattern is great for your wellbeing.`);
      } else if (['sad', 'angry', 'anxious', 'tired', 'frustrated', 'lonely'].includes(mood)) {
        insights.push(`You've been feeling ${mood} most frequently. Consider talking to someone you trust or a professional about these feelings.`);
      }
    }
    
    // Journaling frequency insight
    const entriesPerWeek = (journalData.totalEntries / (journalData.timeframeInDays / 7)).toFixed(1);
    if (entriesPerWeek >= 3) {
      insights.push(`You're journaling frequently (${entriesPerWeek} entries per week), which is excellent for tracking your mental wellness journey.`);
    } else if (entriesPerWeek < 1) {
      insights.push(`You're journaling infrequently (${entriesPerWeek} entries per week). Try setting reminders to journal more regularly.`);
    }
    
    // Add default insight if none generated
    if (insights.length === 0) {
      insights.push("Continue journaling to receive more personalized insights about your emotional patterns.");
    }
    
    return insights;
  } catch (error) {
    console.error("Error generating insights:", error);
    // Return default insight if generation fails
    return ["Continue journaling to receive more personalized insights about your emotional patterns."];
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Get the user session
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: "Unauthorized - Please log in to view your progress" });
    }

    console.log(`Progress analytics requested for user: ${session.user.id}`);
    const { timeframe = 'month' } = req.query;
    const { startDate, endDate } = getDateRange(timeframe);
    
    // Connect to the database
    try {
      await dbConnect();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return res.status(500).json({ 
        error: "Database connection failed. Please try again later.",
        details: process.env.NODE_ENV === "development" ? dbError.message : undefined
      });
    }

    // Get all journal entries for the user within the timeframe
    let entries;
    try {
      entries = await JournalEntry.find({
        userId: session.user.id,
        createdAt: { $gte: startDate, $lte: endDate }
      }).sort({ createdAt: 1 });
      
      console.log(`Found ${entries.length} journal entries for user ${session.user.id}`);
    } catch (queryError) {
      console.error("Error querying journal entries:", queryError);
      return res.status(500).json({ 
        error: "Failed to retrieve journal entries. Please try again later.",
        details: process.env.NODE_ENV === "development" ? queryError.message : undefined
      });
    }
    
    // Return empty data set if no entries found
    if (!entries || entries.length === 0) {
      console.log(`No journal entries found for user ${session.user.id}`);
      return res.status(200).json({
        totalEntries: 0,
        averageSentiment: 0,
        mostCommonMood: null,
        sentimentTrend: [],
        moodDistribution: {},
        activityTrend: [],
        insights: ["You don't have any journal entries in this timeframe. Start journaling to see your progress!"],
        timeframeInDays: Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))
      });
    }
    
    // Calculate sentiment for each entry
    const entriesWithSentiment = entries.map(entry => ({
      ...entry.toObject(),
      sentiment: analyzeSentiment(entry.text)
    }));
    
    // Calculate average sentiment
    const totalSentiment = entriesWithSentiment.reduce((sum, entry) => sum + entry.sentiment, 0);
    const averageSentiment = totalSentiment / entriesWithSentiment.length;
    
    // Calculate mood distribution
    const moodCounts = {};
    entriesWithSentiment.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    // Find most common mood
    let mostCommonMood = null;
    let highestCount = 0;
    
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > highestCount) {
        mostCommonMood = mood;
        highestCount = count;
      }
    });
    
    // Generate sentiment trend data (group by day)
    const sentimentByDay = {};
    entriesWithSentiment.forEach(entry => {
      const dateKey = formatDate(entry.createdAt, timeframe);
      if (!sentimentByDay[dateKey]) {
        sentimentByDay[dateKey] = { total: 0, count: 0 };
      }
      sentimentByDay[dateKey].total += entry.sentiment;
      sentimentByDay[dateKey].count += 1;
    });
    
    const sentimentTrend = Object.entries(sentimentByDay).map(([date, data]) => ({
      date,
      score: data.total / data.count
    }));
    
    // Generate activity trend data (entries per day)
    const activityByDay = {};
    entriesWithSentiment.forEach(entry => {
      const dateKey = formatDate(entry.createdAt, timeframe);
      activityByDay[dateKey] = (activityByDay[dateKey] || 0) + 1;
    });
    
    const activityTrend = Object.entries(activityByDay).map(([date, count]) => ({
      date,
      count
    }));
    
    // Calculate timeframe duration in days
    const timeframeInDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // Generate insights
    const insights = generateInsights({
      totalEntries: entries.length,
      averageSentiment,
      mostCommonMood,
      sentimentTrend,
      timeframeInDays
    });
    
    // Return the analytics data
    const responseData = {
      totalEntries: entries.length,
      averageSentiment,
      mostCommonMood,
      sentimentTrend,
      moodDistribution: moodCounts,
      activityTrend,
      insights,
      timeframeInDays
    };
    
    console.log(`Successfully generated analytics for user ${session.user.id} with ${entries.length} entries`);
    res.status(200).json(responseData);
    
  } catch (error) {
    console.error("Journal analytics error:", error);
    // Send a user-friendly error message while logging the actual error for debugging
    res.status(500).json({ 
      error: "An error occurred while analyzing your journal data. Please try again later.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
} 