"use client";
import LoginForm from './loginform';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LoginPage() {
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
      <Navbar />
      
      <main className="flex-grow flex justify-center items-center px-4 py-8 md:py-12">
        <motion.div 
          className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12"
          variants={contentVariants}
          initial="initial"
          animate="animate"
        >
          {/* Left Side: Welcome Message (Hidden on mobile) */}
          <div className="hidden md:flex flex-col justify-center items-start text-white max-w-md space-y-6 p-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <h2 className="text-4xl font-bold mb-4">Welcome Back</h2>
              <div className="w-20 h-1 bg-blue-400 mb-6"></div>
              <p className="text-lg text-blue-100 mb-8">
                Continue your journey with us and pick up where you left off.
              </p>
              
              <div className="mt-8">
                <p className="text-blue-200 mb-2">Don't have an account?</p>
                <Link href="/signup">
                  <button className="px-6 py-2 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-700 transition-all duration-300">
                    Sign Up
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
          
          {/* Right Side: Login Form */}
          <div className="w-full md:w-1/2 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <LoginForm />
              
              {/* Mobile-only Sign Up Link */}
              <div className="md:hidden text-center mt-6">
                <p className="text-blue-200 mb-2">Don't have an account?</p>
                <Link href="/signup">
                  <button className="px-6 py-2 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-700 transition-all duration-300">
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </motion.div>
  );
}
