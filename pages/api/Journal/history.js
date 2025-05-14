// pages/api/journal/history.js
import dbConnect from "../../../lib/dbConnect";
import JournalEntry from "../../../models/JournalEntry";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: "Unauthorized - Please log in to view your journal history" });
    }

    // Add debugging
    console.log("Fetch Journal History - User ID:", session.user.id);
    console.log("Fetch Journal History - User Provider:", session.user.provider);

    try {
      await dbConnect();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return res.status(500).json({ 
        error: "Database connection failed. Please try again later.",
        details: process.env.NODE_ENV === "development" ? dbError.message : undefined
      });
    }

    try {
      const entries = await JournalEntry.find({ userId: session.user.id }).sort({ createdAt: -1 });
      
      console.log(`Found ${entries.length} journal entries for user ${session.user.id}`);
      
      res.status(200).json(entries);
    } catch (queryError) {
      console.error("Error querying journal entries:", queryError);
      return res.status(500).json({ 
        error: "Failed to retrieve journal entries. Please try again later.",
        details: process.env.NODE_ENV === "development" ? queryError.message : undefined
      });
    }
  } catch (error) {
    console.error("Journal history error:", error);
    res.status(500).json({ 
      error: "An error occurred while retrieving your journal history. Please try again later.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}
