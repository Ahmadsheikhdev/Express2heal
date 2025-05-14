import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function GroupSidebar({ groups, onGroupSelect, onAddGroupClick }) {
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        try {
            const token = localStorage.getItem("heal2");
            
            if (!token) throw new Error("No token found");

            const user = jwtDecode(token);
            setUserRole(user.role);
        } catch (error) {
            console.error("Error decoding token:", error);
            setUserRole(null); // Fallback value
        }
    }, []);

    return (
<div className="w-1/4 h-full overflow-y-auto p-4 border-r border-gray-300" style={{ backgroundColor: "#142762" }}>
<div className="flex justify-between items-center mb-4 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md shadow-md">
                <h2 className="text-xl font-bold text-white">Groups</h2>
                {userRole === "admin" && (
                    <button
                        className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-md shadow-md hover:bg-blue-100 transition-all"
                        onClick={onAddGroupClick} // Call function passed from parent
                    >
                        Add Group
                    </button>
                )}
            </div>

            {groups.length > 0 ? (
                <div className="space-y-4 p-3">
                    {groups.map((group) => (
                        <div
                            key={group._id}
                            className="cursor-pointer p-4 bg-white rounded-lg shadow-lg flex items-center justify-between gap-4 hover:bg-blue-50 hover:scale-105 transition-all duration-300"
                            onClick={() => onGroupSelect(group)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {group.name[0].toUpperCase()} 
                                </div>
                                <p className="text-black font-medium">{group.name}</p>
                            </div>
                            <div className="text-gray-400 font-medium">
                                {group.members.length}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center mt-4">No groups available</p>
            )}
        </div>
    );
}
