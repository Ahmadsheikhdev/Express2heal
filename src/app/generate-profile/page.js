"use client";

import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { Copy, Share2, X, Download, Loader2, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

export default function GenerateProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null); // Store PDF URL
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Only fetch profile if the user is authenticated
    if (status === 'authenticated') {
      fetchProfile();
    } else if (status !== 'loading') {
      // If authentication check is complete and user is not authenticated
      setLoading(false);
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/generateProfile");
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to generate PDF
  const generatePDF = () => {
    if (!profile) return;

    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(`${profile.username}'s Profile`, 20, 20);
    doc.setFont("helvetica", "normal");
    doc.text(`Mood: ${profile.mood}`, 20, 40);
    doc.text(`Frequent Topics: ${profile.frequentTopics.join(", ")}`, 20, 50);
    doc.text(`Potential Concerns: ${profile.potentialConcerns}`, 20, 60);

    // Convert to Blob and store in state
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
    setShowModal(true);
  };

  // Function to copy profile data
  const copyProfile = () => {
    if (!profile) return;
    const text = `
      ${profile.username}'s Profile
      Mood: ${profile.mood}
      Frequent Topics: ${profile.frequentTopics.join(", ")}
      Potential Concerns: ${profile.potentialConcerns}
    `;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Function to download PDF directly
  const downloadPDF = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${profile.username}-profile.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Login prompt component when user is not authenticated
  const LoginPrompt = () => (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-[0_0_25px_rgba(59,130,246,0.2)] w-full max-w-2xl border border-gray-700 backdrop-blur-sm text-center">
      <LogIn className="h-16 w-16 text-blue-400 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
      <p className="text-gray-300 mb-8">
        You need to be logged in to view and share your psychological profile.
        Your profile is generated based on your journal entries.
      </p>
      <Link 
        href="/login?callbackUrl=/generate-profile" 
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300 inline-flex items-center font-medium"
      >
        <LogIn className="h-5 w-5 mr-2" /> Login Now
      </Link>
    </div>
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-between text-white bg-gradient-to-br from-gray-900 via-indigo-950 to-black p-6">
      <Navbar />

      <div className="w-full max-w-4xl flex flex-col items-center justify-center flex-grow py-12">
        <div className="w-full text-center mb-10">
          <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Generated Profile
          </h1>
          <p className="text-gray-300 text-lg">View and share your AI-generated psychological profile</p>
        </div>

        {status === 'loading' || (status === 'authenticated' && loading) ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-300 animate-pulse">Analyzing your profile data...</p>
          </div>
        ) : status === 'unauthenticated' ? (
          <LoginPrompt />
        ) : profile ? (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-[0_0_25px_rgba(59,130,246,0.2)] w-full max-w-2xl border border-gray-700 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
              <h2 className="text-3xl font-bold text-white">
                <span className="text-blue-400">{profile.username}'s</span> Profile
              </h2>
              <div className="bg-blue-600 text-xs font-bold px-3 py-1 rounded-full text-white">
                AI Generated
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="bg-gray-800/50 p-4 rounded-xl">
                <p className="text-gray-400 text-sm mb-1">Current Mood</p>
                <p className="text-xl font-medium">{profile.mood}</p>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-xl">
                <p className="text-gray-400 text-sm mb-1">Frequent Topics</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.frequentTopics.map((topic, index) => (
                    <span key={index} className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-xl">
                <p className="text-gray-400 text-sm mb-1">Potential Concerns</p>
                <p className="text-xl font-medium">{profile.potentialConcerns}</p>
              </div>
            </div>

            {/* Share Profile Button */}
            <button 
              onClick={generatePDF} 
              className="mt-8 w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300 flex items-center justify-center font-medium"
            >
              <Share2 size={20} className="mr-2" /> Share Profile
            </button>
          </div>
        ) : (
          <div className="bg-red-900/20 border border-red-800 p-6 rounded-xl text-center">
            <p className="text-red-300">Failed to load profile. Please try again later.</p>
          </div>
        )}
      </div>

      {/* Share Profile Modal */}
      {showModal && pdfUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 animate-fadeIn">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl max-w-md w-full relative border border-gray-700">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-bold mb-6 text-center text-white">Share Your Profile</h3>
            
            <div className="bg-white rounded-xl overflow-hidden mb-6 shadow-inner">
              <iframe src={pdfUrl} className="w-full h-72 border-0" title="Profile PDF"></iframe>
            </div>

            {/* Bottom Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={copyProfile} 
                className={`px-4 py-3 ${copied ? 'bg-green-600' : 'bg-gray-700'} text-white rounded-xl hover:bg-gray-600 transition-colors flex items-center justify-center`}
              >
                {copied ? (
                  <>✓ Copied</>
                ) : (
                  <><Copy size={18} className="mr-2" /> Copy Text</>
                )}
              </button>
              <button 
                onClick={downloadPDF}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors flex items-center justify-center"
              >
                <Download size={18} className="mr-2" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
