import nodemailer from 'nodemailer';
import { withIronSessionApiRoute } from 'iron-session';

async function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Generate a random OTP (6-digit)
    const otp = Math.floor(100000 + Math.random() * 900000);

    try {
      // Store OTP and email in session for verification
      req.session.otp = otp;
      req.session.email = email;
      await req.session.save(); // Save session data

      // Set up the mail transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Use your mail service (e.g., Gmail)
        auth: {
          user: process.env.GMAIL_USER, // Ensure this is set in your environment variables
          pass: process.env.GMAIL_PASS, // Ensure this is set securely
        },
      });

      // Set up the email details
      const mailOptions = {
        from: `"Your App Name" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Your OTP for Verification',
        text: `Your OTP is: ${otp}. It is valid for 15 minutes.`,
      };

      // Send the email
      await transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${email}: ${otp}`);

      // Respond to the client
      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Error sending OTP:', error);

      // Clear session data in case of an error
      req.session.destroy();

      res.status(500).json({ message: 'Failed to send OTP', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

// Wrap withIronSessionApiRoute to handle session management
export default withIronSessionApiRoute(handler, {
  password: process.env.SESSION_SECRET || 'complex_password_for_dev', // Use a secure password in production
  cookieName: 'your-app-cookie-name',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production', // Secure cookies in production
  },
});
