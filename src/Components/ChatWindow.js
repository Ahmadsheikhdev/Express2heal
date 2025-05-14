import { useEffect, useState } from "react";
import axios from "axios";
import { FiMoreVertical } from "react-icons/fi";

export default function ChatWindow({ group }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    setMessages([]);
    setLastTimestamp(null);

    const storedMessages = localStorage.getItem(`messages_${group._id}`);
    if (storedMessages) {
      const parsedMessages = JSON.parse(storedMessages);
      setMessages(parsedMessages);
      if (parsedMessages.length > 0) {
        setLastTimestamp(parsedMessages[parsedMessages.length - 1].createdAt);
      }
    }

    const fetchMessages = async () => {
      try {
        const params = { groupId: group._id };
        if (lastTimestamp) {
          params.lastTimestamp = lastTimestamp;
        }

        const res = await axios.get("/api/message", { params });
        if (res.data.length > 0) {
          setMessages((prev) => [...prev, ...res.data]);
          localStorage.setItem(
            `messages_${group._id}`,
            JSON.stringify([...messages, ...res.data])
          );
          setLastTimestamp(res.data[res.data.length - 1].createdAt);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [group._id, lastTimestamp]);

  const fetchUsers = async () => {
    try {
      console.log("Fetching users");
      const res = await axios.get("/api/user");
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim()) {
      await axios.post("/api/message", {
        groupId: group._id,
        sender: "You",
        content: newMessage,
      });
      setNewMessage("");
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await axios.delete(`/api/group/${group._id}`);
      alert("Group deleted successfully");
      setShowDropdown(false);
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const handleAddMember = () => {
    fetchUsers();
    setShowModal(true);
    setShowDropdown(false);
  };

  const handleConfirmAddMember = async () => {
    if (selectedUser) {
      try {
        await axios.patch("/api/group", {
          groupId: group._id,
          memberEmail: selectedUser,
        });
        alert(`${selectedUser} added successfully`);
        setShowModal(false);
        setSelectedUser("");
      } catch (error) {
        console.error("Error adding member:", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg flex justify-between items-center sticky top-0">
        <h2 className="flex items-center gap-3">
          {group.name}
          <FiMoreVertical
            className="ms-auto text-xl cursor-pointer text-gray-800 hover:bg-gray-400"
            onClick={() => setShowDropdown(!showDropdown)}
          />
        </h2>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute top-12 right-5 bg-white shadow-lg rounded-md p-2 w-40 z-50">
            <button
              className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
              onClick={handleDeleteGroup}
            >
              Delete Group
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
              onClick={handleAddMember}
            >
              Add Member
            </button>
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div key={index} className="flex justify-start">
            <div className="p-3 max-w-[75%] rounded-lg shadow-md text-sm bg-blue-500 text-white self-end mb-2">
              <p className="font-medium">
                {msg.sender !== "You" && msg.sender}
              </p>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Section */}
      <div className="p-4 bg-white border-t flex items-center sticky bottom-0">
        <input
          type="text"
          className="flex-1 p-2 border rounded-lg text-black focus:ring focus:ring-blue-300"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-3">Add Member</h2>
            <select
              className="w-full p-2 border rounded-lg text-black mb-3"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                onClick={handleConfirmAddMember}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
