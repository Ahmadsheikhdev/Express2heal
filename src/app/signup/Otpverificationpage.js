import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function OtpVerificationPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false); // Track OTP verification status
  const router = useRouter();

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setOtpVerified(false); // Reset OTP verification status

    const { email } = router.query; // Fetch the email from the query parameter

    if (!email) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }

    try {
      // Send OTP for verification to the backend
      const response = await axios.post('/api/VerifyOtp', { otp, email });

      if (response.status === 200) {
        // On success, update the OTP verification status
        setOtpVerified(true);
        alert('OTP verified successfully!');
        router.push('/login'); // Redirect to login page
      } else {
        setError('Invalid OTP');
        console.error('OTP is incorrect. Please try again.');
        setOtp(''); // Clear the OTP field to allow user to re-enter it
      }
    } catch (err) {
      // Handle errors
      console.error('OTP verification failed:', err.response?.data?.message || 'Unknown error');
      setError(err.response?.data?.message || 'An error occurred');
      setOtp(''); // Clear OTP field on error to allow re-entry
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
      <h2 className="text-2xl font-bold text-center mb-6">OTP Verification</h2>
      <form onSubmit={handleOtpSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Enter OTP</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button 
          type="submit" 
          className="w-full py-2 mt-4 bg-blue-600 text-white rounded-md"
          disabled={isLoading}
        >
          {isLoading 
            ? 'Verifying...' 
            : otpVerified 
            ? 'OTP Verified' 
            : 'Verify OTP'}
        </button>
      </form>
    </div>
  );
}
