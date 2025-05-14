//models/Group.js
import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    admin: { type: String, required: true },
    members: [{ type: String, required: true }],
}, { timestamps: true });

export default mongoose.models.Group || mongoose.model("Group", GroupSchema);
