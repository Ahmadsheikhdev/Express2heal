// //pages/api/message.js
// import dbConnect from "../../lib/dbConnect";
// import Message from "./../../models/Message";
// import { getSession } from "next-auth/react";
// const mongoose = require('mongoose');

// let clients = [];

// export default async function handler(req, res) {
//     await dbConnect();
//     const session = await getSession({ req });

//     // if (!session) {
//     //     return res.status(401).json({ message: "Unauthorized" });
//     // }

//     const { method } = req;

//     switch (method) {
//         case "POST":
//             try {
//                 const { groupId, sender, content } = req.body;
//                 const message = await Message.create({ groupId, sender, content });
//                 console.log("message from backend: ", message);
                
//                 clients.forEach((client) => client.json([message]));
//                 clients = [];
                
//                 res.status(201).json(message);
//             } catch (error) {
//                 res.status(400).json({ success: false, error: error.message });
//             }
//             break;

//         case "GET":
//     try {
//         const { groupId } = req.query;
    
//         if (!groupId) {
//           return res.status(400).json({ success: false, error: "groupId is required" });
//         }
    
//         const filter = { groupId };
//         console.log("groupId: ", groupId);
        
//         // If lastTimestamp exists, fetch messages after that timestamp
//         // if (lastTimestamp) {
//         //     filter.createdAt = { $gt: new Date(lastTimestamp) };
//         // }
//         console.log("filter: ", filter);
    
//         // Fetch latest messages (sorted by createdAt)
//         const messages = await Message.find(filter)
//                 console.log("messages: ", messages);

//         return res.status(200).json(messages);
//       } catch (error) {
//         console.error("Error fetching messages:", error);
//         return res.status(500).json({ success: false, error: error.message });
//       }
//             break;

//         default:
//             res.setHeader("Allow", ["POST", "GET"]);
//             res.status(405).end(`Method ${method} Not Allowed`);
//     }
// }










import dbConnect from "../../lib/dbConnect";
import Message from "../../models/Message";
import User from "../../models/User";
import { getSession } from "next-auth/react";
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    await dbConnect();
    const { method } = req;
    
    // Try to get session from NextAuth
    const session = await getSession({ req });
    
    // If no session, try to get token from Authorization header
    let user = null;
    if (!session) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                // Try to verify JWT token
                if (process.env.JWT_SECRET) {
                    user = jwt.verify(token, process.env.JWT_SECRET);
                } else {
                    // If JWT_SECRET is not available, try to parse the token
                    try {
                        user = JSON.parse(token);
                    } catch (e) {
                        // If parsing fails, it might be a JWT token without verification
                        console.log("Could not parse token, might be JWT without verification");
                    }
                }
            } catch (error) {
                console.error("Token verification error:", error);
            }
        }
    }
    
    // Use session user or token user
    const authenticatedUser = session?.user || user;

    switch (method) {
        case "POST":
            try {
                if (!authenticatedUser) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                
                const { groupId, content, sender } = req.body;
                const userEmail = authenticatedUser.email;
                
                // Check if user has a display name and has enabled useDisplayNameInChats
                const userRecord = await User.findOne({ email: userEmail });
                
                // Determine sender name based on user preferences
                let senderName = sender || userEmail;
                if (userRecord && userRecord.useDisplayNameInChats && userRecord.displayName) {
                    senderName = userRecord.displayName;
                } else if (authenticatedUser.name) {
                    senderName = authenticatedUser.name;
                }
                
                console.log("groupId, sender, content : ", groupId, senderName, content);
                const message = await Message.create({ 
                    groupId, 
                    sender: senderName, 
                    content,
                    senderEmail: userEmail // Store the email for reference
                });
                
                console.log("message: ", message);
                res.status(201).json(message);
            } catch (error) {
                console.error("Error creating message:", error);
                res.status(400).json({ success: false, error: error.message });
            }
            break;

        case "GET":
            try {
                const { groupId, lastTimestamp } = req.query;
                if (!groupId) {
                    return res.status(400).json({ success: false, error: "groupId is required" });
                }

                let filter = { groupId };

                // If lastTimestamp exists, fetch only new messages
                if (lastTimestamp) {
                    filter.createdAt = { $gt: new Date(lastTimestamp) };
                }

                const messages = await Message.find(filter).sort({ createdAt: 1 });
                
                // If user is authenticated, mark their own messages
                if (authenticatedUser) {
                    const userEmail = authenticatedUser.email;
                    
                    // Map through messages and mark the user's own messages
                    const processedMessages = messages.map(msg => {
                        const msgObj = msg.toObject();
                        
                        // Check if this message was sent by the current user
                        if (msgObj.senderEmail === userEmail) {
                            msgObj.sender = "You";
                        }
                        
                        return msgObj;
                    });
                    
                    return res.status(200).json(processedMessages);
                }
                
                return res.status(200).json(messages);
            } catch (error) {
                console.error("Error fetching messages:", error);
                return res.status(500).json({ success: false, error: error.message });
            }
            break;

        default:
            res.setHeader("Allow", ["POST", "GET"]);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}









// import dbConnect from "../../lib/dbConnect";
// import Message from "../../models/Message";
// import mongoose from "mongoose";

// export const config = {
//     api: {
//         bodyParser: false, // SSE requires this disabled
//     },
// };

// let clients = new Map(); // Store SSE clients per group

// async function initChangeStream(groupId) {
//     await dbConnect();

//     const pipeline = [{ $match: { "fullDocument.groupId": groupId } }];
// console.log("Pipleline: ", pipeline)
//     const changeStream = Message.watch(pipeline);

//     changeStream.on("change", (change) => {
//         if (change.operationType === "insert") {
//             const newMessage = change.fullDocument;

//             // Send message update to all connected clients for this group
//             if (clients.has(groupId)) {
//                 clients.get(groupId).forEach((res) => {
//                     res.write(`data: ${JSON.stringify(newMessage)}\n\n`);
//                 });
//             }
//         }
//     });

//     changeStream.on("error", (error) => {
//         console.error("Change Stream Error:", error);
//     });

//     return changeStream;
// }

// export default async function handler(req, res) {
//     const { method } = req;

//     switch (method) {
//         case "POST":
//             try {
//                 let body = "";
//                 req.on("data", chunk => { body += chunk.toString(); });
//                 req.on("end", async () => {
//                     const { groupId, sender, content } = JSON.parse(body);
//                     const message = await Message.create({ groupId, sender, content });
//                     await initChangeStream(groupId);
//                     res.status(201).json(message);
//                 });
//             } catch (error) {
//                 res.status(400).json({ success: false, error: error.message });
//             }
//             break;

//         case "GET":
//             try {
//                 const { groupId, stream } = req.query;

//                 if (!groupId) {
//                     return res.status(400).json({ success: false, error: "groupId is required" });
//                 }

//                 if (stream === "true") {
//                     res.setHeader("Content-Type", "text/event-stream");
//                     res.setHeader("Cache-Control", "no-cache");
//                     res.setHeader("Connection", "keep-alive");
//                     res.flushHeaders();

//                     await initChangeStream(groupId);
//                     // Store SSE client
//                     if (!clients.has(groupId)) {
//                         clients.set(groupId, []);
//                     }
//                     clients.get(groupId).push(res);

//                     // Remove client on close
//                     req.on("close", () => {
//                         clients.set(groupId, clients.get(groupId).filter((c) => c !== res));
//                         res.end();
//                     });

//                 } else {
//                     // Fetch initial chat history
//                     const messages = await Message.find({ groupId }).sort({ createdAt: 1 });
//                     res.status(200).json(messages);
//                 }
//             } catch (error) {
//                 console.error("Error fetching messages:", error);
//                 res.status(500).json({ success: false, error: error.message });
//             }
//             break;

//         default:
//             res.setHeader("Allow", ["POST", "GET"]);
//             res.status(405).end(`Method ${method} Not Allowed`);
//     }
// }
