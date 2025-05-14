//models/Message.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    // groupId: { type: String, required: true },
    sender: { type: String, required: true },
    senderEmail: { type: String, required: true },
    content: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
