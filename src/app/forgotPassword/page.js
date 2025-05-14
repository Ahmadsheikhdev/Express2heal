"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset messages
    setMessage("");
    setErrorMessage("");

    const response = await fetch("/api/forgotPassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.status === 200) {
      setMessage(data.message);
    } else {
      setErrorMessage(data.message);
    }
  };

  return (
    <div className="navy-blue p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded-md text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 mt-4 bg-blue-600 text-white rounded-md transition-all duration-300 transform hover:bg-blue-700 active:scale-95"
        >
          Send Reset Link
        </button>
      </form>

      {message && (
        <div className="mt-4 text-green-600 text-center">{message}</div>
      )}
      {errorMessage && (
        <div className="mt-4 text-red-600 text-center">{errorMessage}</div>
      )}

      <div className="text-center mt-4">
        <p className="text-sm">
          Remembered your password?{" "}
          <Link href="/login" className="text-blue-600">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
