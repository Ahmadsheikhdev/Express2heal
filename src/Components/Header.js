// src/components/Header.js
"use client";  // If using React hooks in this component, mark it as a client component

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-400 to-navy-500 text-white p-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold">Express2Heal</h1>
        <nav>
          <ul className="flex space-x-8">
            <li>
              <Link href="/" className="text-lg hover:text-gray-300 transition duration-300">Home</Link>
            </li>
            <li>
              <Link href="/login" className="text-lg hover:text-gray-300 transition duration-300">Login</Link>
            </li>
            <li>
              <Link href="/signup" className="text-lg hover:text-gray-300 transition duration-300">Sign Up</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
