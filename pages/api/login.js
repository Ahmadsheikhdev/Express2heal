import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

// This endpoint is now deprecated in favor of NextAuth.js credentials provider
// It's kept for backward compatibility
export default async function handler(req, res) {
  if (req.method === 'POST') {
    await dbConnect();
    const { email, password } = req.body;

    try {
      // Check if user exists in the database
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Validate the password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Generate a JWT token
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          name: user.name,
          provider: 'credentials'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Set the token as a cookie for secure access
      res.setHeader('Set-Cookie', serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 3600,
      }));

      // Respond with success and user details
      res.status(200).json({
        message: 'Login successful',
        user: { 
          id: user._id.toString(), 
          email: user.email, 
          name: user.name,
          provider: 'credentials'
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error logging in', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
