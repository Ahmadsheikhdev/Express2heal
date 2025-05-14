"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import Navbar from "../../Components/Navbar";
import { FiBarChart2, FiTrendingUp, FiCalendar, FiSmile, FiActivity } from "react-icons/fi";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'rgba(255, 255, 255, 0.8)',
        font: {
          family: 'Parkinsans',
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      titleColor: 'rgba(255, 255, 255, 0.9)',
      bodyColor: 'rgba(255, 255, 255, 0.8)',
      borderColor: 'rgba(79, 70, 229, 0.3)',
      borderWidth: 1,
      padding: 10,
      bodyFont: {
        family: 'Parkinsans',
      },
      titleFont: {
        family: 'Parkinsans',
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          family: 'Parkinsans',
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          family: 'Parkinsans',
        }
      }
    }
  }
};

export default function ProgressPage() {
  const { data: session, status } = useSession();
  const [journalData, setJournalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('month'); // 'week', 'month', 'year'
  
  useEffect(() => {
    if (status === 'authenticated') {
      fetchJournalAnalytics();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, timeframe]);
  
  const fetchJournalAnalytics = async () => {
    try {
      setLoading(true);
      
      // Try with the correct case first (capital J as in file system),
      // but fall back to lowercase if that fails
      let res;
      try {
        res = await fetch(`/api/Journal/analytics?timeframe=${timeframe}`);
        if (!res.ok && res.status === 404) {
          throw new Error('Endpoint not found with capital J');
        }
      } catch (firstError) {
        console.log('Trying alternate API path with lowercase...');
        res = await fetch(`/api/journal/analytics?timeframe=${timeframe}`);
      }
      
      if (!res.ok) {
        console.error(`API response error: ${res.status} ${res.statusText}`);
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error fetching data: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Journal analytics data received:", data.totalEntries);
      setJournalData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching journal analytics:', err);
      setError(err.message || 'Unable to load your data. Please try again later.');
      
      // In case data is needed for development, provide fallback data
      if (process.env.NODE_ENV === 'development') {
        console.log('Loading fallback data for development');
        setJournalData({
          totalEntries: 0,
          averageSentiment: 0,
          mostCommonMood: null,
          sentimentTrend: [],
          moodDistribution: {},
          activityTrend: [],
          insights: ["You don't have any journal entries yet. Start journaling to see your progress!"],
          timeframeInDays: 30
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Check if user has enough journal entries
  const hasEnoughEntries = journalData?.totalEntries >= 2;
  
  // Format data for sentiment chart
  const sentimentChartData = journalData && {
    labels: journalData.sentimentTrend.map(item => item.date),
    datasets: [
      {
        label: 'Sentiment Score',
        data: journalData.sentimentTrend.map(item => item.score),
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
        fill: true,
      }
    ]
  };
  
  // Format data for mood distribution chart
  const moodChartData = journalData && {
    labels: Object.keys(journalData.moodDistribution),
    datasets: [
      {
        label: 'Journal Entries by Mood',
        data: Object.values(journalData.moodDistribution),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(248, 113, 113, 0.7)',
          'rgba(251, 191, 36, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(20, 184, 166, 0.7)',
          'rgba(6, 182, 212, 0.7)',
          'rgba(79, 70, 229, 0.7)',
          'rgba(244, 114, 182, 0.7)',
        ],
        borderWidth: 1,
      }
    ]
  };
  
  // Format data for activity chart
  const activityChartData = journalData && {
    labels: journalData.activityTrend.map(item => item.date),
    datasets: [
      {
        label: 'Journal Entries',
        data: journalData.activityTrend.map(item => item.count),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderRadius: 4,
      }
    ]
  };
  
  // Login prompt component
  const LoginPrompt = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <motion.div 
        className="bg-slate-800/50 backdrop-blur-lg p-8 rounded-xl shadow-lg border border-slate-700/50 max-w-md"
        variants={itemVariants}
      >
        <FiActivity className="text-5xl text-indigo-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
        <p className="text-slate-300 mb-6">
          Please log in to view your personal progress statistics and analytics.
        </p>
        <a href="/login" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg transition-colors duration-200 font-medium">
          Log In Now
        </a>
      </motion.div>
    </div>
  );
  
  // Not enough entries component
  const NotEnoughEntries = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <motion.div 
        className="bg-slate-800/50 backdrop-blur-lg p-8 rounded-xl shadow-lg border border-slate-700/50 max-w-md"
        variants={itemVariants}
      >
        <FiBarChart2 className="text-5xl text-amber-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">More Entries Needed</h2>
        <p className="text-slate-300 mb-6">
          You need at least 2 journal entries to generate progress insights. 
          Continue journaling to see your trends and analytics.
        </p>
        <a href="/Journalpage" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg transition-colors duration-200 font-medium">
          Start Journaling
        </a>
      </motion.div>
    </div>
  );
  
  return (
    <motion.div 
      className="flex flex-col min-h-screen bg-gradient-to-br from-slate-800 to-slate-900"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Navbar />
      
      {/* Main Content */}
      <div className="flex-1 pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <motion.div 
          className="text-center mb-8"
          variants={itemVariants}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Your Progress Journey</h1>
          <p className="text-slate-300 max-w-3xl mx-auto">
            Track your emotional trends and journaling activity over time.
            These insights can help you understand your mental wellness journey.
          </p>
        </motion.div>
        
        {status === 'loading' || loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : status === 'unauthenticated' ? (
          <LoginPrompt />
        ) : error ? (
          <div className="p-6 bg-red-500/20 border border-red-500/30 rounded-lg text-white text-center max-w-2xl mx-auto">
            <p>{error}</p>
          </div>
        ) : !hasEnoughEntries ? (
          <NotEnoughEntries />
        ) : (
          <>
            {/* Timeframe Selection */}
            <motion.div 
              className="flex flex-wrap justify-center gap-3 mb-8"
              variants={itemVariants}
            >
              {['week', 'month', 'year'].map((option) => (
                <button
                  key={option}
                  onClick={() => setTimeframe(option)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    timeframe === option
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700/70 text-slate-300 hover:bg-slate-600/70'
                  }`}
                >
                  <FiCalendar className="inline mr-2" />
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </motion.div>
            
            {/* Stats Overview */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              variants={itemVariants}
            >
              <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Total Entries</h3>
                  <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <FiBarChart2 className="text-indigo-400 text-xl" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{journalData?.totalEntries || 0}</p>
                <p className="text-sm text-slate-400 mt-1">Journal entries created</p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Average Sentiment</h3>
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <FiSmile className="text-blue-400 text-xl" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{journalData?.averageSentiment.toFixed(1) || 0}</p>
                <p className="text-sm text-slate-400 mt-1">Average sentiment score (-1 to +1)</p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Most Common Mood</h3>
                  <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <FiTrendingUp className="text-purple-400 text-xl" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{journalData?.mostCommonMood || "N/A"}</p>
                <p className="text-sm text-slate-400 mt-1">Your most frequent emotional state</p>
              </div>
            </motion.div>
            
            {/* Charts */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
              variants={itemVariants}
            >
              {/* Sentiment Trend Chart */}
              <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-slate-700/50">
                <h3 className="text-xl font-medium text-white mb-4">Sentiment Trend</h3>
                <div className="h-[300px]">
                  {sentimentChartData && <Line options={chartOptions} data={sentimentChartData} />}
                </div>
                <p className="text-sm text-slate-400 mt-4">
                  Sentiment scores range from -1 (very negative) to +1 (very positive).
                </p>
              </div>
              
              {/* Mood Distribution Chart */}
              <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-slate-700/50">
                <h3 className="text-xl font-medium text-white mb-4">Mood Distribution</h3>
                <div className="h-[300px]">
                  {moodChartData && <Bar options={chartOptions} data={moodChartData} />}
                </div>
                <p className="text-sm text-slate-400 mt-4">
                  Distribution of your explicitly selected moods across journal entries.
                </p>
              </div>
            </motion.div>
            
            {/* Activity Trend Chart */}
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-slate-700/50 mb-8"
              variants={itemVariants}
            >
              <h3 className="text-xl font-medium text-white mb-4">Journaling Activity</h3>
              <div className="h-[300px]">
                {activityChartData && <Bar options={chartOptions} data={activityChartData} />}
              </div>
              <p className="text-sm text-slate-400 mt-4">
                Your journaling frequency over time. Regular journaling contributes to better mental wellness tracking.
              </p>
            </motion.div>
            
            {/* Insights Section */}
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-slate-700/50 mb-8"
              variants={itemVariants}
            >
              <h3 className="text-xl font-medium text-white mb-4">Personal Insights</h3>
              <div className="space-y-4">
                {journalData?.insights.map((insight, index) => (
                  <div key={index} className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/30">
                    <p className="text-slate-200">{insight}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
} 