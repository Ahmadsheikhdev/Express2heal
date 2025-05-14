// pages/api/journal/save.js
import dbConnect from "../../../lib/dbConnect";
import JournalEntry from "../../../models/JournalEntry";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Add debugging
    console.log("Save Journal - User ID:", session.user.id);
    console.log("Save Journal - User Provider:", session.user.provider);

    const { mood, text } = req.body;

    if (!text || !mood) {
      return res.status(400).json({ error: "Mood and text are required" });
    }

    await dbConnect();

    const newEntry = new JournalEntry({
      userId: session.user.id,
      mood,
      text,
    });

    await newEntry.save();

    res.status(201).json({ message: "Journal entry saved successfully!" });
  } catch (error) {
    console.error("Journal save error:", error);
    res.status(500).json({ error: error.message });
  }
}
