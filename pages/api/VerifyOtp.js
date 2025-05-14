import dbConnect from '../../lib/dbConnect';  
import User from '../../models/User';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await dbConnect();

    const { email, otp } = req.body;
    console.log('Received data:', req.body);

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check OTP and expiration time
    if (user.otp === otp && new Date(user.otpExpires).getTime() > Date.now()) {
      // Mark user as verified
      user.isVerified = true;
      // Reset OTP fields
      user.otp = '';
      user.otpExpires = null;
      await user.save();

      // Generate JWT Token for authentication
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email,
          name: user.name,
          isVerified: true
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set the token as a cookie for secure access
      res.setHeader('Set-Cookie', serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      }));

      return res.status(200).json({ 
        message: 'OTP Verified Successfully', 
        token, 
        user: { 
          id: user._id.toString(), 
          email: user.email,
          name: user.name,
          isVerified: true
        } 
      });
    } else {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    console.error('Error in /api/verifyOtp:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
