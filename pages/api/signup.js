import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../../lib/sendEmail';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await dbConnect();
    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log(`Email already registered: ${email}`);
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate OTP and set expiration
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // OTP valid for 15 minutes

      // Create user instance
      const user = new User({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpires,
        isVerified: true, // Set users as verified by default
      });

      // Save user to the database
      const savedUser = await user.save();

      if (savedUser) {
        console.log(`User saved successfully: ${savedUser.email}`);
        console.log(`OTP generated and saved for email: ${email}`);

        // Send OTP via email
        try {
          await sendEmail({
            to: email,
            subject: 'Your OTP for Signup',
            text: `Your OTP is ${otp}. It is valid for 15 minutes.`,
          });
          console.log(`OTP sent to email: ${email}`);
          return res.status(200).json({ message: 'Signup successful, OTP sent to email' });
        } catch (emailError) {
          console.error('Failed to send OTP:', emailError);
          return res.status(500).json({ message: 'Failed to send OTP' });
        }
      } else {
        console.error('User save operation failed.');
        return res.status(500).json({ message: 'Failed to save user data in the database.' });
      }
    } catch (error) {
      console.error('Error in signup:', error.message);

      // Specific database error handling
      if (error.name === 'MongoError' && error.code === 11000) {
        return res.status(400).json({ message: 'Duplicate key error: Email already exists.' });
      }

      res.status(500).json({ message: 'Error registering user.', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}