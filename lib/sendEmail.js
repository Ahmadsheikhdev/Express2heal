import nodemailer from 'nodemailer';

export async function sendEmail(mailOptions) {
  // Set up the mail transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to another email service if needed
    auth: {
      user: process.env.GMAIL_USER, // Ensure this is set in your environment variables
      pass: process.env.GMAIL_PASS, // Ensure this is set securely
    },
  });

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${mailOptions.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Propagate the error to be handled by the caller
  }
}
