import dbConnect from "../../lib/dbConnect";
import JournalEntry from "../../models/JournalEntry";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

// Simple sentiment analysis function for text analysis
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
    
    return {
      score: sentimentScore,
      positiveCount,
      negativeCount,
      positiveWords: positiveWords.filter(word => new RegExp('\\b' + word + '\\b', 'g').test(lowerText)),
      negativeWords: negativeWords.filter(word => new RegExp('\\b' + word + '\\b', 'g').test(lowerText))
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    // Return neutral sentiment if analysis fails
    return {
      score: 0,
      positiveCount: 0,
      negativeCount: 0,
      positiveWords: [],
      negativeWords: []
    };
  }
}

// Extract common topics from journal entries
function extractTopics(entries) {
  // Common stop words to ignore
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'about', 
    'in', 'of', 'with', 'is', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 
    'do', 'does', 'did', 'doing', 'can', 'could', 'should', 'would', 'may', 'might', 'must', 
    'i', 'me', 'my', 'mine', 'myself', 'you', 'your', 'yours', 'yourself', 'he', 'him', 'his', 
    'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'we', 'us', 'our', 
    'ours', 'ourselves', 'they', 'them', 'their', 'theirs', 'themselves', 'this', 'that', 
    'these', 'those', 'am', 'are', 'as', 'if', 'then', 'else', 'when', 'up', 'down', 'so',
    'just', 'very', 'really', 'quite', 'much', 'more', 'most', 'some', 'any', 'all', 'only'
  ]);

  // Domain-specific topics to watch for
  const domainTopics = {
    "work": ['job', 'career', 'work', 'office', 'boss', 'colleague', 'coworker', 'project', 'task', 'meeting', 'deadline', 'performance'],
    "relationships": ['relationship', 'friend', 'family', 'partner', 'spouse', 'husband', 'wife', 'boyfriend', 'girlfriend', 'marriage', 'date', 'dating', 'love', 'breakup', 'argument', 'social'],
    "health": ['health', 'doctor', 'sick', 'illness', 'medicine', 'symptoms', 'pain', 'sleep', 'exercise', 'diet', 'nutrition', 'workout', 'fitness'],
    "mental health": ['anxiety', 'stress', 'depression', 'therapy', 'therapist', 'counseling', 'counselor', 'mental', 'emotion', 'feelings', 'mood', 'panic', 'worry', 'trauma'],
    "self-improvement": ['goal', 'plan', 'habit', 'routine', 'improvement', 'growth', 'development', 'learn', 'skills', 'progress', 'achievement', 'success', 'future'],
    "personal finance": ['money', 'finance', 'financial', 'budget', 'saving', 'spending', 'debt', 'bills', 'expenses', 'income', 'salary', 'investment'],
    "hobbies": ['hobby', 'read', 'book', 'music', 'art', 'paint', 'draw', 'sport', 'game', 'movie', 'show', 'travel', 'trip']
  };

  // Word frequency counter
  const wordCount = {};
  // Domain topic counter
  const topicMatches = {};
  
  // Analyze each entry
  entries.forEach(entry => {
    const text = entry.text.toLowerCase();
    const words = text.split(/\s+/);
    
    // Count word frequency
    words.forEach(word => {
      // Remove punctuation and normalize
      const cleanWord = word.replace(/[^\w]/g, '');
      
      // Skip short words and stop words
      if (cleanWord.length <= 2 || stopWords.has(cleanWord)) {
        return;
      }
      
      wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
    });
    
    // Check for domain-specific topics
    Object.entries(domainTopics).forEach(([topic, keywords]) => {
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          topicMatches[topic] = (topicMatches[topic] || 0) + 1;
        }
      });
    });
  });
  
  // Get most frequent words
  const frequentWords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(entry => entry[0]);
  
  // Get most frequent domain topics
  const frequentTopics = Object.entries(topicMatches)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);
  
  return {
    frequentWords,
    frequentTopics: frequentTopics.length > 0 ? frequentTopics : ["No specific topics detected"]
  };
}

// Detect potential concerns from text content and sentiment
function detectConcerns(entries, sentimentResults) {
  // Concern keywords and their associated categories
  const concernKeywords = {
    "anxiety": ['anxiety', 'worried', 'nervous', 'panic', 'fear', 'stressed', 'anxious', 'uneasy'],
    "depression": ['depression', 'sad', 'hopeless', 'worthless', 'unmotivated', 'tired', 'depressed', 'empty'],
    "stress": ['stress', 'overwhelmed', 'pressure', 'tense', 'burnout', 'exhausted', 'overworked'],
    "anger": ['anger', 'angry', 'frustrated', 'irritated', 'rage', 'furious', 'mad', 'resentment'],
    "loneliness": ['lonely', 'alone', 'isolated', 'disconnected', 'abandoned', 'rejected'],
    "self-esteem": ['confidence', 'insecure', 'inadequate', 'failure', 'doubt', 'unworthy']
  };
  
  // Track concern matches across entries
  const concernMatches = {};
  
  // Analyze each entry
  entries.forEach(entry => {
    const text = entry.text.toLowerCase();
    
    // Check for concern keywords
    Object.entries(concernKeywords).forEach(([concern, keywords]) => {
      const matchCount = keywords.reduce((count, keyword) => {
        const regex = new RegExp('\\b' + keyword + '\\b', 'g');
        const matches = text.match(regex);
        return count + (matches ? matches.length : 0);
      }, 0);
      
      if (matchCount > 0) {
        concernMatches[concern] = (concernMatches[concern] || 0) + matchCount;
      }
    });
  });
  
  // Calculate average sentiment
  const totalSentiment = sentimentResults.reduce((sum, result) => sum + result.score, 0);
  const averageSentiment = totalSentiment / sentimentResults.length;
  
  // Count negative entries
  const negativeEntries = sentimentResults.filter(result => result.score < -0.2).length;
  const negativePercentage = (negativeEntries / sentimentResults.length) * 100;
  
  // Get top concerns based on keyword matches
  const topConcerns = Object.entries(concernMatches)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(entry => entry[0]);
  
  // Generate concern text based on analysis
  let concernText = "";
  
  // Add sentiment-based concerns
  if (averageSentiment < -0.3 && negativePercentage > 50) {
    concernText = "Persistent negative emotions detected";
  } else if (topConcerns.length > 0) {
    concernText = topConcerns.map(concern => 
      concern.charAt(0).toUpperCase() + concern.slice(1) + " indicators"
    ).join(", ");
  } else if (averageSentiment < -0.1) {
    concernText = "Mild negative mood patterns";
  } else {
    concernText = "No significant concerns detected";
  }
  
  return concernText;
}

// Main API handler
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: "Unauthorized. Please log in to generate your profile." });
    }
    
    // Connect to database
    try {
      await dbConnect();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return res.status(500).json({ error: "Database connection failed" });
    }
    
    // Fetch all journal entries for the user
    let entries;
    try {
      entries = await JournalEntry.find({ userId: session.user.id }).sort({ createdAt: -1 });
      console.log(`Found ${entries.length} journal entries for profile generation`);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      
      // Return fallback mock data if we can't get real data
      return res.status(200).json({
        username: session.user.name || "User",
        mood: "Unknown",
        frequentTopics: ["No journal data available"],
        potentialConcerns: "No journal data to analyze",
      });
    }
    
    // If no entries, return default profile
    if (!entries || entries.length === 0) {
      return res.status(200).json({
        username: session.user.name || "User",
        mood: "Unknown",
        frequentTopics: ["No journal entries yet"],
        potentialConcerns: "Start journaling to see insights",
      });
    }
    
    // Analyze sentiment for each entry
    const sentimentResults = entries.map(entry => analyzeSentiment(entry.text));
    
    // Extract topics
    const { frequentTopics } = extractTopics(entries);
    
    // Find most common mood
    const moodCounts = {};
    entries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    // Get most frequent mood
    let mostCommonMood = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    // Detect potential concerns
    const potentialConcerns = detectConcerns(entries, sentimentResults);
    
    // Generate profile
    const profile = {
      username: session.user.name || "User",
      mood: mostCommonMood,
      frequentTopics,
      potentialConcerns,
      // MSE score removed as requested
    };
    
    res.status(200).json(profile);
    
  } catch (error) {
    console.error("Error generating profile:", error);
    res.status(500).json({ 
      error: "Failed to generate profile",
      username: "User",
      mood: "Unknown",
      frequentTopics: ["Error generating profile"],
      potentialConcerns: "Please try again later",
    });
  }
}
  