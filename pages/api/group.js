//pages/api/group.js
import dbConnect from "../../lib/dbConnect";
import Group from "../../models/Group";
import { getSession } from "next-auth/react";

const SAMPLE_GROUPS = [
    { id: 1, name: "Mindfulness Practices", admin: "therapist1@example.com", members: ["user1@example.com", "user2@example.com"] },
    { id: 2, name: "Stress Management Support", admin: "therapist2@example.com", members: ["user3@example.com", "user4@example.com"] },
    { id: 3, name: "Cognitive Behavioral Therapy Group", admin: "therapist3@example.com", members: ["user5@example.com", "user6@example.com"] },
    { id: 4, name: "Grief and Loss Support", admin: "therapist4@example.com", members: ["user7@example.com", "user8@example.com"] },
    { id: 5, name: "Anxiety and Depression Support", admin: "therapist5@example.com", members: ["user9@example.com", "user10@example.com"] },
    { id: 6, name: "Emotional Resilience Training", admin: "therapist6@example.com", members: ["user11@example.com", "user12@example.com"] },
    { id: 7, name: "Self-Esteem Building", admin: "therapist7@example.com", members: ["user13@example.com", "user14@example.com"] },
    { id: 8, name: "Trauma Recovery Group", admin: "therapist8@example.com", members: ["user15@example.com", "user16@example.com"] },
    { id: 9, name: "Healthy Relationships Workshop", admin: "therapist9@example.com", members: ["user17@example.com", "user18@example.com"] },
    { id: 10, name: "Art Therapy Group", admin: "therapist10@example.com", members: ["user19@example.com", "user20@example.com"] },
];


export default async function handler(req, res) {
    await dbConnect();
    const session = await getSession({ req });

    // if (!session) {
    //     return res.status(401).json({ message: "Unauthorized" });
    // }

    const { method } = req;

    switch (method) {
        case "POST":
            try {
                const { name, admin, members } = req.body;
                console.log("name, email, members: ", name,admin, members);
                const group = await Group.create({
                    name,
                    // admin: session.user.email,
                    admin: admin,
                    members,
                });
                res.status(201).json(group);
            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
            break;

        case "GET":
            try {
                // // Check if in development mode to return sample groups
                // if (process.env.NODE_ENV === "development") {
                //     return res.status(200).json(SAMPLE_GROUPS);
                // }

                // // Fetch groups from the database for the logged-in user
                // // const groups = await Group.find({ members: session.user.email });
                // const groups = await Group.find();
                // res.status(200).json(groups);


                await dbConnect(); // Ensure connection works
                console.log("Connected to database"); // Debugging
                const groups = await Group.find();
                console.log("Fetched groups:", groups); // Debugging
                res.status(200).json(groups);
            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
            break;

        case "PATCH":
            try {
                const { groupId, memberEmail } = req.body;
                if (!groupId || !memberEmail) {
                    return res.status(400).json({ message: "Group ID and member email are required" });
                }
                
                const group = await Group.findById(groupId);
                if (!group) {
                    return res.status(404).json({ message: "Group not found" });
                }
                
                if (group.members.includes(memberEmail)) {
                    return res.status(400).json({ message: "Member already exists in the group" });
                }
                
                group.members.push(memberEmail);
                await group.save();
                
                res.status(200).json({ success: true, message: "Member added successfully", group });
            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
            break;

        default:
            res.setHeader("Allow", ["POST", "GET"]);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
