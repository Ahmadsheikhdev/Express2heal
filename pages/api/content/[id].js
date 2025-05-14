import dbConnect from '../../../lib/dbConnect';
import Content from '../../../models/Content';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

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

  switch (method) {
    case 'GET':
      try {
        const content = await Content.findById(id)
          .populate('submittedBy', 'name email')
          .populate('reviewedBy', 'name email');
          
        if (!content) {
          return res.status(404).json({ success: false, message: 'Content not found' });
        }
        
        res.status(200).json({ success: true, data: content });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
      
    case 'PUT':
      try {
        const content = await Content.findById(id);
        
        if (!content) {
          return res.status(404).json({ success: false, message: 'Content not found' });
        }
        
        // If status is being updated, add reviewer information
        if (req.body.status && req.body.status !== content.status) {
          req.body.reviewedBy = session.user.id;
          req.body.lastReviewedAt = new Date();
        }
        
        const updatedContent = await Content.findByIdAndUpdate(
          id,
          { ...req.body, updatedAt: new Date() },
          { new: true, runValidators: true }
        );
        
        res.status(200).json({ success: true, data: updatedContent });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
      
    case 'DELETE':
      try {
        // Check if user has permission to delete content
        if (session.user.role !== 'admin' && !session.user.permissions.canDeleteContent) {
          return res.status(403).json({ success: false, message: 'Not authorized to delete content' });
        }
        
        const deletedContent = await Content.findByIdAndDelete(id);
        
        if (!deletedContent) {
          return res.status(404).json({ success: false, message: 'Content not found' });
        }
        
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
      
    default:
      res.status(400).json({ success: false, message: 'Invalid method' });
      break;
  }
} 