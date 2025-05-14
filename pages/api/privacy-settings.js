import dbConnect from "../../lib/dbConnect";
import User from "../../models/User";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
    await dbConnect();
    const session = await getSession({ req });

    if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { method } = req;

    switch (method) {
        case "GET":
            try {
                // Find the user by email from the session
                const user = await User.findOne({ email: session.user.email });
                
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                
                // Return the user's privacy settings
                res.status(200).json({ 
                    success: true, 
                    privacySettings: user.privacySettings || {},
                    displayName: user.displayName || user.name,
                    useDisplayNameInChats: user.useDisplayNameInChats || false
                });
            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
            break;
            
        case "PUT":
            try {
                const { privacySettings, displayName, useDisplayNameInChats } = req.body;
                
                // Find the user by email from the session
                const user = await User.findOne({ email: session.user.email });
                
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                
                // Update privacy settings if provided
                if (privacySettings) {
                    user.privacySettings = {
                        ...user.privacySettings,
                        ...privacySettings
                    };
                }
                
                // Update display name if provided
                if (displayName !== undefined) {
                    user.displayName = displayName;
                }
                
                // Update useDisplayNameInChats if provided
                if (useDisplayNameInChats !== undefined) {
                    user.useDisplayNameInChats = useDisplayNameInChats;
                }
                
                await user.save();
                
                res.status(200).json({ 
                    success: true, 
                    message: "Privacy settings updated successfully",
                    privacySettings: user.privacySettings,
                    displayName: user.displayName,
                    useDisplayNameInChats: user.useDisplayNameInChats
                });
            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
            break;

        default:
            res.setHeader("Allow", ["GET", "PUT"]);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
} 