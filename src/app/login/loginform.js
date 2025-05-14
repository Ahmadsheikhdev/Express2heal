"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import jwt from "jsonwebtoken";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { data: session, status } = useSession();

  // Store token in localStorage when session changes
  useEffect(() => {
    if (session && session.user) {
      // Create a custom token for compatibility with the GroupChat page
      const tokenData = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role || "user",
        provider: session.user.provider || "credentials"
      };
      
      // Store the token in localStorage for the GroupChat page to use
      localStorage.setItem("heal2", JSON.stringify(tokenData));
      console.log("Token stored in localStorage:", tokenData);
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset messages
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      // Use NextAuth.js signIn method for credentials login
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Don't redirect automatically
      });

      if (result.error) {
        // Handle error from NextAuth
        setErrorMessage(result.error || "Login failed. Please try again.");
      } else {
        // On success, show success message and redirect
        setSuccessMessage("Login successful");
        router.push("/"); // Redirect to homepage after successful login
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Google Login handler using next-auth
  const handleGoogleLogin = () => {
    signIn("google"); // Triggers Google sign-in
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      className="text-white"
      initial="hidden"
      animate="visible"
      variants={formVariants}
    >
      <motion.h2 
        className="text-2xl font-bold text-center mb-6"
        variants={itemVariants}
      >
        Log In
      </motion.h2>

      {errorMessage && (
        <motion.div 
          className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {errorMessage}
        </motion.div>
      )}

      {successMessage && (
        <motion.div 
          className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-200 text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {successMessage}
        </motion.div>
      )}

      <motion.form onSubmit={handleSubmit} className="space-y-5" variants={formVariants}>
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium mb-1 text-blue-100">Email</label>
          <input
            type="email"
            className="w-full p-3 bg-white/10 border border-blue-300/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-blue-200/60"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium mb-1 text-blue-100">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-3 bg-white/10 border border-blue-300/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-blue-200/60 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-right">
          <Link href="/forgotPassword" className="text-sm text-blue-300 hover:text-white transition-colors">
            Forgot Password?
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <button
            type="submit"
            className={`w-full py-3 rounded-lg transition-all duration-300 ${
              loading
                ? "bg-blue-700/50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 transform hover:translate-y-[-2px]"
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              "Log In"
            )}
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="relative flex items-center my-6">
          <div className="flex-grow border-t border-blue-300/30"></div>
          <span className="flex-shrink mx-4 text-blue-200 text-sm">OR</span>
          <div className="flex-grow border-t border-blue-300/30"></div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-white text-gray-800 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-100 transition-colors"
          >
            <FaGoogle className="text-red-500" />
            <span>Continue with Google</span>
          </button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}