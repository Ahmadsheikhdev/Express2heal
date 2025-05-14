import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const { method } = req;
  
  await dbConnect();
  
  // Check authentication
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  
  // Check if user is admin
  if (session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  // Check if user has permission to manage users
  if (!session.user.permissions.canManageUsers) {
    return res.status(403).json({ success: false, message: 'Not authorized to manage users' });
  }

  switch (method) {
    case 'GET':
      try {
        const { role, page = 1, limit = 10 } = req.query;
        
        const query = {};
        if (role) {
          query.role = role;
        }
        
        const skip = (page - 1) * limit;
        
        const users = await User.find(query)
          .select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit));
          
        const total = await User.countDocuments(query);
        
        res.status(200).json({ 
          success: true, 
          data: users,
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
      
    case 'PUT':
      try {
        const { userId, role, permissions } = req.body;
        
        if (!userId) {
          return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Update user role and permissions
        if (role) {
          user.role = role;
        }
        
        if (permissions) {
          user.permissions = {
            ...user.permissions,
            ...permissions
          };
        }
        
        await user.save();
        
        // Remove sensitive information
        const userData = user.toObject();
        delete userData.password;
        delete userData.otp;
        delete userData.otpExpires;
        delete userData.resetPasswordToken;
        delete userData.resetPasswordExpires;
        
        res.status(200).json({ success: true, data: userData });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;
      
    default:
      res.status(400).json({ success: false, message: 'Invalid method' });
      break;
  }
} 