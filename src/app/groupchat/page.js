"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../../Components/Navbar";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FiPlus, FiUsers, FiMessageCircle, FiLogOut, FiLogIn, FiLogIn as FiLogin } from "react-icons/fi";
import Link from "next/link";
import { useSession } from "next-auth/react";

// Set up axios interceptor for authentication
axios.interceptors.request.use(
    config => {
        // Try to get the token from NextAuth session first
        if (typeof window !== 'undefined') {
            const tokenStr = localStorage.getItem("heal2");
            if (tokenStr) {
                config.headers.Authorization = `Bearer ${tokenStr}`;
            }
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default function GroupChatPage() {
    const { data: session, status } = useSession();
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groups, setGroups] = useState([]);
    const [allGroups, setAllGroups] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userId, setUserId] = useState("");
    const [userRole, setUserRole] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState("myGroups"); // "myGroups" or "allGroups"
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
    };

    useEffect(() => {
        if (status === 'authenticated' && session) {
            setIsLoggedIn(true);
            setUserId(session.user.id);
            setUserEmail(session.user.email);
            setUserRole(session.user.role || "user");
            
            // Fetch groups with session user
            fetchGroups({
                id: session.user.id,
                email: session.user.email
            });
            setLoading(false);
        } else if (status === 'unauthenticated') {
            // Fall back to localStorage method if NextAuth session is not available
            checkLoginStatus();
        }
    }, [status, session]);

    const checkLoginStatus = async () => {
        setLoading(true);
        try {
            // Get user info from token - use try/catch specifically for token handling
            const tokenStr = localStorage.getItem("heal2");
            if (!tokenStr) {
                setIsLoggedIn(false);
                setLoading(false);
                return;
            }
            
            // Try to parse the token
            let user;
            try {
                user = JSON.parse(tokenStr);
            } catch (parseError) {
                try {
                    user = jwtDecode(tokenStr);
                } catch (jwtError) {
                    console.error("Failed to parse token:", parseError);
                    console.error("Failed to decode JWT:", jwtError);
                    setIsLoggedIn(false);
                    setLoading(false);
                    return;
                }
            }
            
            if (!user || !user.id) {
                setIsLoggedIn(false);
                setLoading(false);
                return;
            }
            
            // User is logged in
            setIsLoggedIn(true);
            setUserId(user.id);
            setUserEmail(user.email || "");
            setUserRole(user.role || "user");
            
            // Now fetch groups since we're logged in
            fetchGroups(user);
        } catch (error) {
            console.error("Error checking login status:", error);
            setIsLoggedIn(false);
            setLoading(false);
        }
    };

    const fetchGroups = async (user) => {
        setError(null);
        try {
            // Fetch all groups
            const response = await axios.get("/api/group");
            
            if (response.data && Array.isArray(response.data)) {
                // Filter user's groups - check both id and email for membership
                const userGroups = response.data.filter(group => 
                    group.members.some(member => 
                        member === user.id || 
                        member === user.email ||
                        member.toString() === user.id.toString()
                    )
                );
                
                setGroups(userGroups);
                setAllGroups(response.data);
            } else {
                setError("Invalid response format from server");
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
            setError("Failed to fetch groups. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddGroup = async () => {
        if (!groupName.trim()) {
            alert("Please enter group name.");
            return;
        }
    
        try {
            const tokenStr = localStorage.getItem("heal2");
            if (!tokenStr) throw new Error("Not logged in");
            
            // Parse token
            let user;
            try {
                user = JSON.parse(tokenStr);
            } catch (parseError) {
                user = jwtDecode(tokenStr);
            }
            
            const res = await axios.post("/api/group", {
                name: groupName,
                admin: user.email,
                members: [user.id],
            });
    
            setGroups(prev => [...prev, res.data]);
            setAllGroups(prev => [...prev, res.data]);
            setIsModalOpen(false);
            setGroupName("");
        } catch (error) {
            console.error("Error adding group:", error);
            alert("Failed to create group. Please try again.");
        }
    };

    const handleJoinGroup = async (group) => {
        try {
            const tokenStr = localStorage.getItem("heal2");
            if (!tokenStr) throw new Error("Not logged in");
            
            // Parse token
            let user;
            try {
                user = JSON.parse(tokenStr);
            } catch (parseError) {
                user = jwtDecode(tokenStr);
            }
            
            await axios.patch("/api/group", {
                groupId: group._id,
                memberEmail: user.id,
            });
            
            // Update local state
            const updatedGroup = {...group, members: [...group.members, user.id]};
            setAllGroups(prev => prev.map(g => g._id === group._id ? updatedGroup : g));
            setGroups(prev => [...prev, updatedGroup]);
            
            alert(`You have joined ${group.name}`);
        } catch (error) {
            console.error("Error joining group:", error);
            alert("Failed to join group. Please try again.");
        }
    };

    const handleLeaveGroup = async (group) => {
        try {
            const tokenStr = localStorage.getItem("heal2");
            if (!tokenStr) throw new Error("Not logged in");
            
            // Parse token
            let user;
            try {
                user = JSON.parse(tokenStr);
            } catch (parseError) {
                user = jwtDecode(tokenStr);
            }
            
            await axios.post("/api/group/leave", {
                groupId: group._id,
                memberId: user.id,
            });
            
            // Update local state
            const updatedGroup = {
                ...group, 
                members: group.members.filter(m => 
                    m !== user.id && 
                    m !== user.email && 
                    m.toString() !== user.id.toString()
                )
            };
            
            setAllGroups(prev => prev.map(g => g._id === group._id ? updatedGroup : g));
            setGroups(prev => prev.filter(g => g._id !== group._id));
            
            // If the current selected group is the one being left, deselect it
            if (selectedGroup && selectedGroup._id === group._id) {
                setSelectedGroup(null);
            }
            
            alert(`You have left ${group.name}`);
        } catch (error) {
            console.error("Error leaving group:", error);
            alert("Failed to leave group. Please try again.");
        }
    };

    const fetchMessages = async (groupId) => {
        try {
            let headers = { 'Content-Type': 'application/json' };
            
            // Add authentication headers
            if (status === 'authenticated' && session) {
                headers.Authorization = `Bearer ${session.user.id}`;
            } else {
                const tokenStr = localStorage.getItem("heal2");
                if (tokenStr) {
                    headers.Authorization = `Bearer ${tokenStr}`;
                }
            }
            
            const res = await axios.get("/api/message", { 
                params: { groupId },
                headers
            });
            
            setMessages(res.data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedGroup) return;
        
        setIsSending(true);
        try {
            // Use session if available
            if (status === 'authenticated' && session) {
                // Include the session token in the request headers
                const response = await axios.post("/api/message", {
                    groupId: selectedGroup._id,
                    content: newMessage,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        // Add the session token to the request
                        'Authorization': `Bearer ${session.user.id}`
                    }
                });
                
                if (response.status === 201) {
                    // Refresh messages
                    fetchMessages(selectedGroup._id);
                    setNewMessage("");
                }
            } else {
                // Fall back to localStorage method
                const tokenStr = localStorage.getItem("heal2");
                if (!tokenStr) throw new Error("Not logged in");
                
                // Parse token
                let user;
                try {
                    user = JSON.parse(tokenStr);
                } catch (parseError) {
                    user = jwtDecode(tokenStr);
                }
                
                const response = await axios.post("/api/message", {
                    groupId: selectedGroup._id,
                    sender: user.email,
                    content: newMessage,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tokenStr}`
                    }
                });
                
                if (response.status === 201) {
                    // Refresh messages
                    fetchMessages(selectedGroup._id);
                    setNewMessage("");
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    const handleSelectGroup = (group) => {
        setSelectedGroup(group);
        fetchMessages(group._id);
    };

    const displayedGroups = activeTab === "myGroups" ? groups : allGroups;
    const isAdmin = userRole === "admin";

    // Login prompt component
    const LoginPrompt = () => (
        <motion.div 
            className="flex flex-col items-center justify-center h-[80vh] text-center p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="bg-slate-800/50 backdrop-blur-lg p-8 rounded-xl shadow-lg border border-slate-700/50 max-w-md">
                <FiLogin className="text-6xl text-indigo-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">Log in to Start Group Chat</h2>
                <p className="text-slate-300 mb-8">
                    You need to be logged in to view and participate in group chats. 
                    Please log in to continue.
                </p>
                <Link href="/login">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center mx-auto"
                    >
                        <FiLogIn className="mr-2" /> Log In
                    </motion.button>
                </Link>
                <p className="text-slate-400 mt-4 text-sm">
                    Don't have an account? <Link href="/signup" className="text-indigo-400 hover:text-indigo-300">Sign up</Link>
                </p>
            </div>
        </motion.div>
    );

    return (
        <motion.div 
            className="flex flex-col min-h-screen bg-gradient-to-br from-slate-800 to-slate-900"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Navbar */}
            <Navbar />

            {/* Main Content Area */}
            {loading ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : !isLoggedIn ? (
                <LoginPrompt />
            ) : (
                <div className="flex flex-1 overflow-hidden mt-[60px] p-4">
                    {/* Sidebar */}
                    <motion.div 
                        className="w-full md:w-1/3 lg:w-1/4 bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-slate-700/50 overflow-hidden flex flex-col mr-4"
                        variants={itemVariants}
                    >
                        <div className="p-4 bg-slate-800 border-b border-slate-700/50">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-white">Groups</h2>
                                {isAdmin && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsModalOpen(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors duration-200"
                                    >
                                        <FiPlus className="text-lg" />
                                    </motion.button>
                                )}
                            </div>
                            
                            <div className="flex bg-slate-700/30 rounded-lg p-1">
                                <button 
                                    className={`flex-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                                        activeTab === "myGroups" 
                                            ? "bg-indigo-600 text-white" 
                                            : "text-slate-300 hover:bg-slate-700/50"
                                    }`}
                                    onClick={() => setActiveTab("myGroups")}
                                >
                                    My Groups
                                </button>
                                <button 
                                    className={`flex-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                                        activeTab === "allGroups" 
                                            ? "bg-indigo-600 text-white" 
                                            : "text-slate-300 hover:bg-slate-700/50"
                                    }`}
                                    onClick={() => setActiveTab("allGroups")}
                                >
                                    Discover
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                            {error ? (
                                <div className="text-red-400 p-3 bg-red-500/10 rounded-lg text-center">
                                    <p>{error}</p>
                                </div>
                            ) : displayedGroups.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <p className="text-sm">
                                        {activeTab === "myGroups" 
                                            ? "You haven't joined any groups yet." 
                                            : "No groups available to join."}
                                    </p>
                                    {activeTab === "myGroups" && (
                                        <button 
                                            onClick={() => setActiveTab("allGroups")}
                                            className="mt-2 text-indigo-400 hover:text-indigo-300"
                                        >
                                            Discover groups
                                        </button>
                                    )}
                                </div>
                            ) : (
                                displayedGroups.map((group) => {
                                    const isUserMember = group.members.some(member => 
                                        member === userId || 
                                        member === userEmail || 
                                        member.toString() === userId.toString()
                                    );
                                    
                                    return (
                                        <motion.div
                                            key={group._id}
                                            whileHover={{ scale: 1.01 }}
                                            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                                selectedGroup && selectedGroup._id === group._id
                                                    ? "bg-indigo-600/30 border border-indigo-500/50"
                                                    : "bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50"
                                            }`}
                                            onClick={() => isUserMember ? handleSelectGroup(group) : null}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {group.name[0].toUpperCase()}
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-white font-medium">{group.name}</p>
                                                        <p className="text-xs text-slate-400">
                                                            <FiUsers className="inline mr-1" />
                                                            {group.members.length} members
                                                        </p>
                                                    </div>
                                                </div>
                                                {!isUserMember ? (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleJoinGroup(group);
                                                        }}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors duration-200"
                                                    >
                                                        <FiLogIn className="text-sm" />
                                                    </motion.button>
                                                ) : (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleLeaveGroup(group);
                                                        }}
                                                        className="bg-slate-600 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors duration-200"
                                                    >
                                                        <FiLogOut className="text-sm" />
                                                    </motion.button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>

                    {/* Chat Window */}
                    <motion.div 
                        className="flex-1 flex flex-col bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-slate-700/50 overflow-hidden"
                        variants={itemVariants}
                    >
                        {selectedGroup ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 bg-slate-800 border-b border-slate-700/50">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                            {selectedGroup.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-white">{selectedGroup.name}</h2>
                                            <p className="text-xs text-slate-400">
                                                <FiUsers className="inline mr-1" />
                                                {selectedGroup.members.length} members
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Messages Container */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                    {messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                            <FiMessageCircle className="text-4xl mb-2" />
                                            <p>No messages yet. Start the conversation!</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, index) => {
                                            // Check if message is from current user by comparing with both email and "You"
                                            const isCurrentUser = msg.sender === userEmail || 
                                                                 msg.sender === "You" || 
                                                                 (session && msg.senderEmail === session.user.email);
                                            return (
                                                <div 
                                                    key={msg._id || index} 
                                                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div 
                                                        className={`p-3 max-w-[75%] rounded-lg shadow-md ${
                                                            isCurrentUser 
                                                                ? 'bg-indigo-600 text-white' 
                                                                : 'bg-slate-700 text-slate-200'
                                                        }`}
                                                    >
                                                        {!isCurrentUser && (
                                                            <p className="text-xs font-medium text-slate-300 mb-1">
                                                                {msg.sender}
                                                            </p>
                                                        )}
                                                        <p>{msg.content}</p>
                                                        <p className="text-xs opacity-70 mt-1 text-right">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                
                                {/* Input Section */}
                                <div className="p-4 bg-slate-800 border-t border-slate-700/50 flex items-center">
                                    <input
                                        type="text"
                                        className="flex-1 p-3 bg-slate-700/50 text-white rounded-lg border border-slate-600/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={sendMessage}
                                        disabled={isSending}
                                        className={`ml-3 px-4 py-3 ${
                                            isSending ? 'bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'
                                        } text-white rounded-lg transition-colors duration-200 flex items-center`}
                                    >
                                        {isSending ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        ) : (
                                            "Send"
                                        )}
                                    </motion.button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                <FiMessageCircle className="text-5xl text-slate-500 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Welcome to Group Chat</h3>
                                <p className="text-slate-400 max-w-md">
                                    {groups.length > 0 
                                        ? "Select a group from the sidebar to start chatting" 
                                        : "Join a group to start chatting with others"}
                                </p>
                                {groups.length === 0 && !isAdmin && (
                                    <div className="mt-4 text-slate-400">
                                        <p>Click on "Discover" to find and join groups</p>
                                    </div>
                                )}
                                {groups.length === 0 && isAdmin && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsModalOpen(true)}
                                        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 flex items-center"
                                    >
                                        <FiPlus className="mr-2" /> Create a Group
                                    </motion.button>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Create Group Modal - Only for Admins */}
            {isModalOpen && isAdmin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-md border border-slate-700"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Create a New Group</h3>
                        <input
                            type="text"
                            placeholder="Group Name"
                            className="w-full p-3 bg-slate-700/50 text-white rounded-lg border border-slate-600/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 mb-4"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200" 
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200" 
                                onClick={handleAddGroup}
                            >
                                Create Group
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(30, 41, 59, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(99, 102, 241, 0.3);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(99, 102, 241, 0.5);
                }
            `}</style>
        </motion.div>
    );
}
