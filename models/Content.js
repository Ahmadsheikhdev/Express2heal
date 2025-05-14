import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  source: { 
    type: String, 
    enum: ['Google Scholar', 'Google Books', 'Manual Submission'],
    required: true 
  },
  sourceUrl: { 
    type: String 
  },
  author: { 
    type: String 
  },
  submittedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Needs Revision'],
    default: 'Pending'
  },
  reviewNotes: { 
    type: String 
  },
  tags: [{ 
    type: String 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  lastReviewedAt: { 
    type: Date 
  }
});

export default mongoose.models.Content || mongoose.model('Content', ContentSchema); 