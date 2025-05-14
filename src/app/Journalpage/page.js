"use client";
import { useState, useEffect } from "react";
import Navbar from "../../Components/Navbar";
import { motion } from "framer-motion";

export default function Journal() {
  const [journalText, setJournalText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [mood, setMood] = useState("Happy");
  const [showMessage, setShowMessage] = useState(false);
  const [journalHistory, setJournalHistory] = useState([]);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchJournalHistory();
  }, []);

  const fetchJournalHistory = async () => {
    try {
      const res = await fetch("/api/Journal/history");
      if (res.ok) {
        const data = await res.json();
        console.log("Journal history fetched:", data.length, "entries");
        setJournalHistory(data);
      } else {
        const errorData = await res.json();
        console.error("Failed to fetch journal history:", errorData);
        alert("Failed to fetch journal history. Please try again later.");
      }
    } catch (err) {
      console.error("Error fetching journal history:", err);
      alert("Error fetching journal history. Please try again later.");
    }
  };

  const handleTextChange = (e) => {
    setJournalText(e.target.value);
    const words = e.target.value.trim() === "" ? 0 : e.target.value.trim().split(/\s+/).length;
    setWordCount(words);
  };

  const saveEntry = async () => {
    if (journalText.trim() === "") {
      alert("Your journal is empty. Write something to save!");
      return;
    }

    setIsSaving(true);
    try {
      console.log("Saving journal entry with mood:", mood);
      const res = await fetch("/api/Journal/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mood, text: journalText }),
      });

      if (res.ok) {
        console.log("Journal entry saved successfully");
        setShowMessage(true);
        setJournalText("");
        setWordCount(0);
        fetchJournalHistory();
        setTimeout(() => setShowMessage(false), 3000);
      } else {
        const errorData = await res.json();
        console.error("Failed to save journal entry:", errorData);
        alert("Failed to save journal entry. Please try again later.");
      }
    } catch (err) {
      console.error("Error saving journal entry:", err);
      alert("Error saving journal entry. Please try again later.");
    } finally {
      setIsSaving(false);
    }
  };

  const clearEntry = () => {
    if (confirm("Are you sure you want to clear your journal?")) {
      setJournalText("");
      setWordCount(0);
    }
  };

  const handleNewJournal = () => {
    setSelectedJournal(null);
    setJournalText("");
    setWordCount(0);
    setMood("Happy");
  };

  const handleSelectJournal = (entry) => {
    setSelectedJournal(entry);
  };

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-800 to-slate-900 pt-20">
      <Navbar />
      <motion.div 
        className="flex flex-1 container mx-auto p-4 md:p-8 gap-4 md:gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        
        {/* Left Sidebar for Past Entries */}
        <motion.div 
          className="w-full md:w-1/3 bg-slate-800/50 backdrop-blur-lg p-4 md:p-6 rounded-xl shadow-lg text-white border border-slate-700/50"
          variants={itemVariants}
        >
          <h2 className="text-xl md:text-2xl font-bold text-slate-200 mb-4 flex items-center">
            <span className="mr-2">📝</span> Your Journal Entries
          </h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewJournal}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg mb-4 transition-colors duration-200 flex items-center justify-center"
          >
            <span className="mr-2">✍️</span> New Journal
          </motion.button>
          
          {journalHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">No journal entries yet.</p>
              <p className="text-xs mt-2">Start writing to see your entries here.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1 custom-scrollbar">
              {journalHistory.map((entry) => (
                <motion.div
                  key={entry._id}
                  whileHover={{ scale: 1.01 }}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedJournal && selectedJournal._id === entry._id
                      ? "bg-indigo-600/30 border border-indigo-500/50"
                      : "bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50"
                  }`}
                  onClick={() => handleSelectJournal(entry)}
                >
                  <div className="flex items-center mb-1">
                    <span className="mr-2">
                      {entry.mood === "Happy" ? "😊" : 
                       entry.mood === "Sad" ? "😢" : 
                       entry.mood === "Excited" ? "🤩" : 
                       entry.mood === "Angry" ? "😠" : 
                       entry.mood === "Anxious" ? "😰" : 
                       entry.mood === "Relaxed" ? "😌" : 
                       entry.mood === "Tired" ? "😴" : 
                       entry.mood === "Confident" ? "😎" : 
                       entry.mood === "Frustrated" ? "😤" : 
                       entry.mood === "Grateful" ? "🙏" : 
                       entry.mood === "Lonely" ? "😔" : "💪"}
                    </span>
                    <span className="text-sm font-medium text-slate-300">{entry.mood}</span>
                  </div>
                  <p className="truncate text-slate-300">{entry.text}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right Container for Journal Input or Selected Entry */}
        <motion.div 
          className="w-full md:w-2/3 bg-slate-800/50 backdrop-blur-lg p-4 md:p-8 rounded-xl shadow-lg text-white border border-slate-700/50"
          variants={itemVariants}
        >
          {selectedJournal ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-200">
                  Journal Entry
                </h1>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNewJournal}
                  className="text-sm bg-slate-700 hover:bg-slate-600 text-white py-1 px-3 rounded-lg transition-colors duration-200"
                >
                  Back to Writing
                </motion.button>
              </div>
              
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">
                  {selectedJournal.mood === "Happy" ? "😊" : 
                   selectedJournal.mood === "Sad" ? "😢" : 
                   selectedJournal.mood === "Excited" ? "🤩" : 
                   selectedJournal.mood === "Angry" ? "😠" : 
                   selectedJournal.mood === "Anxious" ? "😰" : 
                   selectedJournal.mood === "Relaxed" ? "😌" : 
                   selectedJournal.mood === "Tired" ? "😴" : 
                   selectedJournal.mood === "Confident" ? "😎" : 
                   selectedJournal.mood === "Frustrated" ? "😤" : 
                   selectedJournal.mood === "Grateful" ? "🙏" : 
                   selectedJournal.mood === "Lonely" ? "😔" : "💪"}
                </span>
                <span className="text-lg font-medium text-slate-300">{selectedJournal.mood}</span>
              </div>
              
              <div className="bg-slate-700/30 p-5 rounded-lg border border-slate-600/30 mb-4">
                <p className="text-lg whitespace-pre-wrap">{selectedJournal.text}</p>
              </div>
              
              <p className="text-sm text-slate-400">
                Written on {new Date(selectedJournal.createdAt).toLocaleDateString()} at {new Date(selectedJournal.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <header className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-200">Your Journal</h1>
                <p className="text-slate-400 mt-2">Capture your thoughts and feelings</p>
              </header>

              <div>
                <label htmlFor="mood" className="block text-slate-300 font-medium mb-2">
                  How are you feeling today?
                </label>
                <select
                  id="mood"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full bg-slate-700/50 text-white p-3 rounded-lg border border-slate-600/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200"
                >
                  <option value="Happy">😊 Happy</option>
                  <option value="Sad">😢 Sad</option>
                  <option value="Excited">🤩 Excited</option>
                  <option value="Angry">😠 Angry</option>
                  <option value="Anxious">😰 Anxious</option>
                  <option value="Relaxed">😌 Relaxed</option>
                  <option value="Tired">😴 Tired</option>
                  <option value="Confident">😎 Confident</option>
                  <option value="Frustrated">😤 Frustrated</option>
                  <option value="Grateful">🙏 Grateful</option>
                  <option value="Lonely">😔 Lonely</option>
                  <option value="Motivated">💪 Motivated</option>
                </select>

                <div className="relative mt-4">
                  <textarea
                    value={journalText}
                    onChange={handleTextChange}
                    className="w-full h-60 bg-slate-700/50 text-white p-4 rounded-lg resize-none border border-slate-600/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200"
                    placeholder="What's on your mind today?"
                  ></textarea>
                  <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={saveEntry} 
                    disabled={isSaving}
                    className={`${
                      isSaving ? 'bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'
                    } text-white py-2 px-6 rounded-lg transition-colors duration-200 flex items-center`}
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>Save</>
                    )}
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearEntry} 
                    className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-6 rounded-lg transition-colors duration-200"
                  >
                    Clear
                  </motion.button>
                </div>

                {showMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-3 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg text-center"
                  >
                    Entry saved successfully!
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </div>
  );
}
