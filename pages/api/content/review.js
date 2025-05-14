import dbConnect from '../../../lib/dbConnect';
import Content from '../../../models/Content';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const { method } = req;
  
  await dbConnect();
  
  // Check authentication
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  
  // Check if user is admin or content validator
  if (session.user.role !== 'admin' && session.user.role !== 'content_validator') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  // Check if user has permission to approve content
  if (!session.user.permissions.canApproveContent) {
    return res.status(403).json({ success: false, message: 'Not authorized to review content' });
  }

  if (method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { contentId, status, reviewNotes } = req.body;
    
    if (!contentId || !status) {
      return res.status(400).json({ success: false, message: 'Content ID and status are required' });
    }
    
    // Validate status
    const validStatuses = ['Approved', 'Rejected', 'Needs Revision'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const content = await Content.findById(contentId);
    
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    
    // Update content status
    content.status = status;
    content.reviewNotes = reviewNotes || '';
    content.reviewedBy = session.user.id;
    content.lastReviewedAt = new Date();
    content.updatedAt = new Date();
    
    await content.save();
    
    res.status(200).json({ success: true, data: content });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
} 