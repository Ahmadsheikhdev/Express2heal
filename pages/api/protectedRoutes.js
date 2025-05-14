import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  // Get the token from the cookie or headers
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to the request object

    // Proceed with the logic for the protected route
    res.status(200).json({ message: 'Protected route accessed' });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
