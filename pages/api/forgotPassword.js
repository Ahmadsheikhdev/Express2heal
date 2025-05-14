import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await dbConnect();

    const { email } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Set token expiration time
      user.resetPasswordToken = resetTokenHash;
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
      await user.save();

      // Send email with reset link
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      const resetUrl = `${process.env.BASE_URL}/resetPassword/${resetToken}`;
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        text: `You can reset your password using the link below:\n\n${resetUrl}`,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
      console.error('Error sending reset email:', error);
      res.status(500).json({ message: 'Error processing your request' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
