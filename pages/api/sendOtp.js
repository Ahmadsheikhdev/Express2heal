import nodemailer from 'nodemailer';
import { randomInt } from 'crypto';  // For secure OTP generation
let otpStore = {};  // Temporary storage (use a database for production)

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate a secure OTP
    const otp = randomInt(100000, 999999).toString();

    // Store OTP temporarily (use a persistent database for production)
    otpStore[email] = { otp, timestamp: Date.now() };

    // Configure nodemailer transporter
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,  // Use environment variables for email credentials
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'OTP sent' });
    } catch (error) {
      console.error('Error sending OTP:', error);
      const errorMessage = error.response ? error.response.body : error.message;
      res.status(500).json({ error: 'Failed to send OTP', details: errorMessage });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
