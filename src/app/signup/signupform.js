import { useState } from 'react';
import Link from 'next/link';
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import axios from 'axios';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateName = (name) => /^[A-Za-z\s]{3,}$/.test(name);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[A-Z]|\d)[A-Za-z\d@$!%*?&]{6,}$/.test(password);
  const validateOtp = (otp) => /^\d{6}$/.test(otp);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!validateName(name)) {
      setError('Name must be at least 3 characters long and contain only letters and spaces.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long and include at least one uppercase letter or a number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/signup', { name, email, password });

      if (response.status === 200) {
        setOtpSent(true);
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError(err.response.data.message); // Display the error message
      } else {
        setError('Error sending OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateOtp(otp)) {
      setError('OTP must be a 6-digit number.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/VerifyOtp', { email, otp });

      if (response.status === 200) {
        console.log('OTP Verified Successfully!');
        // Show success message
        alert('Account created successfully! Please login to continue.');
        // Redirect to login page
        window.location.href = '/login';
      } else {
        setError('Invalid OTP.');
        setOtp(''); // Clear the OTP field to allow re-entry
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError(err.response.data.message); // Display the error message
      } else {
        setError('Error verifying OTP. Please try again.');
      }
      setOtp(''); // Clear OTP field to allow re-entry
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signIn('google');
    } catch (error) {
      console.error('Google signup error:', error);
      setError('Google signup failed. Please try again.');
    }
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
        {otpSent ? 'Verify OTP' : 'Create Account'}
      </motion.h2>

      {error && (
        <motion.div 
          className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {!otpSent ? (
        <motion.form onSubmit={handleEmailSubmit} className="space-y-5" variants={formVariants}>
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium mb-1 text-blue-100">Name</label>
            <input
              type="text"
              className="w-full p-3 bg-white/10 border border-blue-300/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-blue-200/60"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </motion.div>

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
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <p className="text-xs text-blue-200 mt-1">
              At least 6 characters with one uppercase letter or number
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium mb-1 text-blue-100">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full p-3 bg-white/10 border border-blue-300/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-blue-200/60 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
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
                  <span>Sending OTP...</span>
                </div>
              ) : (
                "Send OTP"
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
              onClick={handleGoogleSignup}
              className="w-full py-3 bg-white text-gray-800 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-100 transition-colors"
            >
              <FaGoogle className="text-red-500" />
              <span>Sign up with Google</span>
            </button>
          </motion.div>
        </motion.form>
      ) : (
        <motion.form onSubmit={handleSubmit} className="space-y-5" variants={formVariants}>
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium mb-1 text-blue-100">Enter OTP</label>
            <input
              type="text"
              className="w-full p-3 bg-white/10 border border-blue-300/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-blue-200/60"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              required
            />
            <p className="text-xs text-blue-200 mt-1">
              A 6-digit OTP has been sent to your email
            </p>
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
                  <span>Verifying OTP...</span>
                </div>
              ) : (
                "Verify & Create Account"
              )}
            </button>
          </motion.div>
        </motion.form>
      )}
    </motion.div>
  );
}