import dbConnect from "../../../lib/dbConnect";
import Group from "../../../models/Group";

export default async function handler(req, res) {
    await dbConnect();
    
    // Only allow POST method
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    
    try {
        const { groupId, memberId } = req.body;
        
        if (!groupId || !memberId) {
            return res.status(400).json({ message: 'Group ID and member ID are required' });
        }
        
        // Find the group
        const group = await Group.findById(groupId);
        
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        
        // Check if member is in the group
        const memberIndex = group.members.findIndex(m => 
            m === memberId || m.toString() === memberId
        );
        
        if (memberIndex === -1) {
            return res.status(400).json({ message: 'Member is not in this group' });
        }
        
        // Remove member from the group
        group.members.splice(memberIndex, 1);
        await group.save();
        
        return res.status(200).json({ 
            success: true, 
            message: 'Member removed from group successfully',
            group
        });
    } catch (error) {
        console.error('Error leaving group:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
} 