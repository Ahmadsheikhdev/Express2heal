import bcrypt from "bcrypt";
import dbConnect from "../../lib/dbConnect";
import User from "../../models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    await dbConnect();

    // Fetch the user (replace `req.user.email` with actual user identification logic)
    const user = await User.findOne({ email: "test@example.com" }); // Example email

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // For Google users
    if (!user.password) {
      return res.status(400).json({
        error: "Google users cannot change their password here.",
      });
    }

    // Verify the current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "Current password is incorrect." });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
