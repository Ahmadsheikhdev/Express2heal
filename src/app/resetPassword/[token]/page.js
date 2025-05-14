"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function ResetPasswordPage() {
  const { token } = useParams(); // Directly extract the token from the params object
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const response = await fetch("/api/resetPassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();
    setMessage(data.message);

    if (response.ok) {
      router.push("/login");
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-center">Reset Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <div>
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-md"
        >
          Reset Password
        </button>
      </form>
      {message && <div className="mt-4 text-center">{message}</div>}
    </div>
  );
}
