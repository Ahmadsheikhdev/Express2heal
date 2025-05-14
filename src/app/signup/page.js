"use client";

import SignupForm from './signupform'; // Import the SignupForm component
import Navbar from '../../Components/Navbar'; // Correct relative path
import Footer from '../../Components/Footer'; // Correct relative path
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SignupPage() {
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.7,
        delay: 0.2
      } 
    }
  };

  return (
    <motion.div 
      className="flex flex-col min-h-screen bg-gradient-to-b from-blue-600 to-navy-900"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <Navbar /> {/* Replaced Header with Navbar */}
      
      <main className="flex-grow flex justify-center items-center px-4 py-8 md:py-12">
        <motion.div 
          className="w-full max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-12"
          variants={contentVariants}
          initial="initial"
          animate="animate"
        >
          {/* Left Side: Signup Form */}
          <div className="w-full md:w-1/2 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <SignupForm />
              
              {/* Mobile-only Login Link */}
              <div className="md:hidden text-center mt-6">
                <p className="text-blue-200 mb-2">Already have an account?</p>
                <Link href="/login">
                  <button className="px-6 py-2 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-700 transition-all duration-300">
                    Log In
                  </button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right Side: Welcome Message (Hidden on mobile) */}
          <div className="hidden md:flex flex-col justify-center items-start text-white max-w-md space-y-6 p-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <h2 className="text-4xl font-bold mb-4">Join Express2Heal</h2>
              <div className="w-20 h-1 bg-blue-400 mb-6"></div>
              <p className="text-lg text-blue-100 mb-8">
                Start your healing journey today and become part of our supportive community.
              </p>
              
              <div className="mt-8">
                <p className="text-blue-200 mb-2">Already have an account?</p>
                <Link href="/login">
                  <button className="px-6 py-2 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-700 transition-all duration-300">
                    Log In
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </motion.div>
  );
}
