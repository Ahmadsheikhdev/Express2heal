const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  query: {
    type: String,
    required: true,
  },
  searchType: {
    type: String,
    enum: ['google', 'scholar', 'books'],
    default: 'google',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index for userId and timestamp for efficient queries
SearchHistorySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.models.SearchHistory || mongoose.model('SearchHistory', SearchHistorySchema); 