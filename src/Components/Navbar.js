"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { FiBook, FiBarChart2 } from "react-icons/fi";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMainPage, setIsMainPage] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility
  const router = useRouter();

  const { data: session, status } = useSession({
    required: false,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    if (typeof window !== "undefined") {
      setIsMainPage(window.location.pathname === "/");
    }

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Add a useEffect to check session status
  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [session, status]);

  const handleLogout = () => {
    signOut();
    router.push("/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const isGoogleUser = session?.user?.provider === 'google';

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-black bg-opacity-50" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-8 w-8"
          />
          <h1 className="text-white text-2xl font-bold">Express2Heal</h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-4 relative">
          {/* Home Button: Shown only on non-main pages */}
          {!isMainPage && (
            <Link
              href="/"
              className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-200"
            >
              Home
            </Link>
          )}

          {/* Resources Link: Always visible */}
          <Link
            href="/resources"
            className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-all duration-200 flex items-center"
          >
            <FiBook className="mr-2" /> Resources
          </Link>

          {status === "unauthenticated" ? (
            <>
              {/* Login Button */}
              <Link
                href="/login"
                className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-200"
              >
                Login
              </Link>

              {/* Sign Up Button */}
              <Link
                href="/signup"
                className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-200"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {/* View Progress Button: Only for logged-in users */}
              <Link
                href="/progress"
                className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-all duration-200 flex items-center"
              >
                <FiBarChart2 className="mr-2" /> View Progress
              </Link>
              
              {/* User Profile with Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 text-white bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-full transition-all duration-200 focus:outline-none"
                >
                  <img
                    src={isGoogleUser ? "/google-profile-icon.png" : "/profile-icon.png"}
                    alt="Profile"
                    className="h-6 w-6 rounded-full"
                  />
                  <span>{session?.user?.name || "User"}</span>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                    onMouseLeave={closeDropdown}
                  >
                    {/* Privacy Settings Link - Available for all users */}
                    <Link
                      href="/privacy-settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Privacy Settings
                    </Link>
                    
                    {!isGoogleUser && (
                      <Link
                        href="/changePassword"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Change Password
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
