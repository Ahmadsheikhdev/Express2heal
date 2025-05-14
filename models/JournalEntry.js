// models/JournalEntry.js
import mongoose from "mongoose";

const JournalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    mood: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.JournalEntry || mongoose.model("JournalEntry", JournalEntrySchema);
