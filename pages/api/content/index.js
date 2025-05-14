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

  switch (method) {
    case 'GET':
      try {
        const { status, page = 1, limit = 10 } = req.query;
        
        const query = {};
        if (status) {
          query.status = status;
        }
        
        const skip = (page - 1) * limit;
        
        const contents = await Content.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('submittedBy', 'name email')
          .populate('reviewedBy', 'name email');
          
        const total = await Content.countDocuments(query);
        
        res.status(200).json({ 
          success: true, 
          data: contents,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
          }
        });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
      
    case 'POST':
      try {
        const content = await Content.create({
          ...req.body,
          submittedBy: session.user.id
        });
        res.status(201).json({ success: true, data: content });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
      
    default:
      res.status(400).json({ success: false, message: 'Invalid method' });
      break;
  }
} 