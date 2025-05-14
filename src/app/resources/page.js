"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "../../Components/Navbar";
import { FiSearch, FiBookOpen, FiFileText, FiExternalLink, FiInfo, FiBookmark, FiFilter } from "react-icons/fi";

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

// Pre-curated search queries by category
const preCuratedQueries = {
  "Anxiety": [
    { title: "Evidence-based CBT for anxiety", query: "evidence based cognitive behavioral therapy anxiety site:nih.gov OR site:ncbi.nlm.nih.gov" },
    { title: "Self-help books for anxiety", query: "best self-help books anxiety evidence based" },
    { title: "Mindfulness techniques for anxiety", query: "mindfulness based stress reduction anxiety research site:edu" },
    { title: "Anxiety workbooks", query: "anxiety workbook pdf free" }
  ],
  "Depression": [
    { title: "Clinical depression treatments", query: "clinical depression treatment evidence based site:nih.gov" },
    { title: "Depression self-care strategies", query: "depression self-care strategies research based" },
    { title: "Behavioral activation for depression", query: "behavioral activation depression therapy research" },
    { title: "Depression workbooks", query: "depression workbook pdf free" }
  ],
  "Stress Management": [
    { title: "Stress reduction techniques", query: "evidence based stress reduction techniques site:edu" },
    { title: "Work-life balance research", query: "work life balance mental health research site:nih.gov" },
    { title: "Burnout prevention", query: "burnout prevention strategies evidence based" },
    { title: "Stress management workbooks", query: "stress management workbook pdf free" }
  ],
  "Sleep Issues": [
    { title: "Sleep hygiene guidelines", query: "sleep hygiene guidelines evidence based site:edu" },
    { title: "Insomnia cognitive therapy", query: "cognitive behavioral therapy insomnia research site:nih.gov" },
    { title: "Sleep disorders research", query: "sleep disorders treatment research site:ncbi.nlm.nih.gov" },
    { title: "Sleep improvement techniques", query: "sleep improvement techniques evidence based" }
  ],
  "Trauma & PTSD": [
    { title: "PTSD treatment approaches", query: "post traumatic stress disorder treatment approaches site:nih.gov" },
    { title: "Trauma-informed care", query: "trauma informed care best practices site:edu" },
    { title: "EMDR therapy research", query: "eye movement desensitization reprocessing therapy research" },
    { title: "Trauma recovery workbooks", query: "trauma recovery workbook pdf free" }
  ],
  "Relationships": [
    { title: "Healthy relationship skills", query: "healthy relationship skills evidence based" },
    { title: "Communication in relationships", query: "effective communication relationships research site:edu" },
    { title: "Attachment styles research", query: "attachment styles adult relationships research" },
    { title: "Relationship workbooks", query: "relationship workbook pdf free" }
  ]
};

// Recommended resources by category
const recommendedResources = {
  "Anxiety": [
    { 
      title: "NIMH: Anxiety Disorders", 
      url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders", 
      description: "Comprehensive overview of anxiety disorders from the National Institute of Mental Health."
    },
    { 
      title: "Anxiety and Depression Association of America", 
      url: "https://adaa.org/", 
      description: "Resources, support groups, and educational materials for anxiety disorders."
    },
    { 
      title: "The Anxiety Workbook (Free PDF)", 
      url: "https://www.therapistaid.com/therapy-worksheets/anxiety/none", 
      description: "Free worksheets and resources for managing anxiety."
    }
  ],
  "Depression": [
    { 
      title: "NIMH: Depression", 
      url: "https://www.nimh.nih.gov/health/topics/depression", 
      description: "Comprehensive overview of depression from the National Institute of Mental Health."
    },
    { 
      title: "Depression CBT Self-Help Guide", 
      url: "https://www.cci.health.wa.gov.au/Resources/Looking-After-Yourself/Depression", 
      description: "Free evidence-based CBT workbooks for depression."
    },
    { 
      title: "Mental Health America: Depression", 
      url: "https://www.mhanational.org/conditions/depression", 
      description: "Information, screening tools, and resources for depression."
    }
  ],
  "Stress Management": [
    { 
      title: "American Psychological Association: Stress", 
      url: "https://www.apa.org/topics/stress", 
      description: "Resources and information on stress management from the APA."
    },
    { 
      title: "Mayo Clinic: Stress Management", 
      url: "https://www.mayoclinic.org/healthy-lifestyle/stress-management/basics/stress-basics/hlv-20049495", 
      description: "Evidence-based strategies for managing stress."
    },
    { 
      title: "Mindfulness-Based Stress Reduction Workbook", 
      url: "https://www.mindfulnesscds.com/pages/books", 
      description: "Resources for mindfulness-based stress reduction."
    }
  ],
  "Sleep Issues": [
    { 
      title: "National Sleep Foundation", 
      url: "https://www.thensf.org/", 
      description: "Research-based information on sleep health and sleep disorders."
    },
    { 
      title: "CDC: Sleep and Sleep Disorders", 
      url: "https://www.cdc.gov/sleep/index.html", 
      description: "Information and resources on sleep health from the CDC."
    },
    { 
      title: "CBT for Insomnia", 
      url: "https://www.sleepfoundation.org/insomnia/treatment/cognitive-behavioral-therapy-insomnia", 
      description: "Evidence-based cognitive behavioral therapy for insomnia."
    }
  ],
  "Trauma & PTSD": [
    { 
      title: "National Center for PTSD", 
      url: "https://www.ptsd.va.gov/", 
      description: "Comprehensive resources on PTSD from the U.S. Department of Veterans Affairs."
    },
    { 
      title: "Trauma-Informed Care Resources", 
      url: "https://www.samhsa.gov/trauma-violence", 
      description: "Resources on trauma-informed care from SAMHSA."
    },
    { 
      title: "The National Child Traumatic Stress Network", 
      url: "https://www.nctsn.org/", 
      description: "Resources for childhood trauma and PTSD."
    }
  ],
  "Relationships": [
    { 
      title: "The Gottman Institute", 
      url: "https://www.gottman.com/", 
      description: "Research-based relationship resources and information."
    },
    { 
      title: "Psychology Today: Relationships", 
      url: "https://www.psychologytoday.com/us/basics/relationships", 
      description: "Articles and resources on healthy relationships."
    },
    { 
      title: "Healthy Relationship Workbook", 
      url: "https://www.therapistaid.com/therapy-worksheets/relationships/none", 
      description: "Free worksheets and resources for healthy relationships."
    }
  ]
};

// Tips for evaluating source credibility
const credibilityTips = [
  "Check the author's credentials and expertise in mental health",
  "Look for peer-reviewed research from reputable journals",
  "Verify information across multiple reliable sources",
  "Check publication dates to ensure information is current",
  "Prefer .edu, .gov, and established medical institution websites",
  "Be cautious of claims that sound too good to be true",
  "Look for evidence-based approaches rather than anecdotal claims",
  "Check if the source has conflicts of interest or commercial bias"
];

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Anxiety");
  const [showTips, setShowTips] = useState(false);
  const [searchType, setSearchType] = useState("google"); // "google", "scholar", or "books"
  const [savedQueries, setSavedQueries] = useState([]);

  // Load saved queries from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("savedQueries");
    if (saved) {
      setSavedQueries(JSON.parse(saved));
    }
  }, []);

  // Save queries to localStorage
  const saveQuery = (query) => {
    const newSavedQueries = [...savedQueries, query];
    setSavedQueries(newSavedQueries);
    localStorage.setItem("savedQueries", JSON.stringify(newSavedQueries));
  };

  // Remove saved query
  const removeQuery = (index) => {
    const newSavedQueries = savedQueries.filter((_, i) => i !== index);
    setSavedQueries(newSavedQueries);
    localStorage.setItem("savedQueries", JSON.stringify(newSavedQueries));
  };

  // Handle search submission
  const handleSearch = (query = searchQuery) => {
    let searchUrl;
    
    switch (searchType) {
      case "scholar":
        searchUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`;
        break;
      case "books":
        searchUrl = `https://books.google.com/books?q=${encodeURIComponent(query)}`;
        break;
      default:
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
    
    window.open(searchUrl, "_blank");
  };

  // Handle pre-curated query click
  const handlePreCuratedSearch = (query) => {
    setSearchQuery(query.query);
    handleSearch(query.query);
  };

  return (
    <motion.div 
      className="flex flex-col min-h-screen bg-gradient-to-br from-slate-800 to-slate-900"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <motion.div 
          className="text-center mb-8"
          variants={itemVariants}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Psychoeducational Resources</h1>
          <p className="text-slate-300 max-w-3xl mx-auto">
            Find evidence-based mental health resources using Google's powerful search tools. 
            Use our pre-curated search queries or create your own specific searches.
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div 
          className="bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-slate-700/50 p-6 mb-8"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter your search query..."
                  className="w-full p-4 pl-12 bg-slate-700/50 text-white rounded-lg border border-slate-600/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200"
                />
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="p-4 bg-slate-700/50 text-white rounded-lg border border-slate-600/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200"
              >
                <option value="google">Google Search</option>
                <option value="scholar">Google Scholar</option>
                <option value="books">Google Books</option>
              </select>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSearch()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-lg transition-colors duration-200 flex items-center"
              >
                <FiSearch className="mr-2" /> Search
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => saveQuery(searchQuery)}
                disabled={!searchQuery.trim()}
                className={`bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-lg transition-colors duration-200 flex items-center ${!searchQuery.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FiBookmark className="mr-2" /> Save
              </motion.button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiFilter className="text-slate-400 mr-2" />
              <span className="text-slate-300 mr-2">Search Tips:</span>
              <span className="text-slate-400 text-sm">
                Add <code className="bg-slate-700 px-1 rounded">site:nih.gov</code> or <code className="bg-slate-700 px-1 rounded">site:edu</code> for academic sources
              </span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTips(!showTips)}
              className="text-indigo-400 hover:text-indigo-300 flex items-center"
            >
              <FiInfo className="mr-1" /> {showTips ? "Hide Tips" : "Source Evaluation Tips"}
            </motion.button>
          </div>
          
          {/* Credibility Tips */}
          {showTips && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30"
            >
              <h3 className="text-white font-medium mb-2">How to Evaluate Source Credibility:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {credibilityTips.map((tip, index) => (
                  <li key={index} className="text-slate-300 text-sm flex items-start">
                    <span className="inline-block w-4 h-4 bg-indigo-500 rounded-full mr-2 mt-1 flex-shrink-0"></span>
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pre-curated Searches */}
          <motion.div 
            className="lg:col-span-2"
            variants={itemVariants}
          >
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-slate-700/50 overflow-hidden">
              <div className="p-4 bg-slate-800 border-b border-slate-700/50">
                <h2 className="text-xl font-bold text-white">Pre-curated Search Queries</h2>
                <p className="text-slate-400 text-sm">Click on any topic to search directly using Google</p>
              </div>
              
              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.keys(preCuratedQueries).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                        selectedCategory === category
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-3">
                  {preCuratedQueries[selectedCategory].map((query, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      className="p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer"
                      onClick={() => handlePreCuratedSearch(query)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-white font-medium">{query.title}</h3>
                          <p className="text-slate-400 text-sm truncate">{query.query}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              saveQuery(query.query);
                            }}
                            className="p-2 text-slate-300 hover:text-indigo-400 transition-colors duration-200"
                          >
                            <FiBookmark />
                          </button>
                          <button className="p-2 text-slate-300 hover:text-indigo-400 transition-colors duration-200">
                            <FiExternalLink />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Saved Searches & Search Tools */}
          <motion.div 
            className="space-y-6"
            variants={itemVariants}
          >
            {/* Search Tools */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-slate-700/50 overflow-hidden">
              <div className="p-4 bg-slate-800 border-b border-slate-700/50">
                <h2 className="text-xl font-bold text-white">Search Tools</h2>
              </div>
              
              <div className="p-4 space-y-3">
                <Link href="https://scholar.google.com/" target="_blank" rel="noopener noreferrer">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200 flex items-center"
                  >
                    <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white mr-3">
                      <FiFileText className="text-lg" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Google Scholar</h3>
                      <p className="text-slate-400 text-sm">Academic papers and research</p>
                    </div>
                  </motion.div>
                </Link>
                
                <Link href="https://books.google.com/" target="_blank" rel="noopener noreferrer">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200 flex items-center"
                  >
                    <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center text-white mr-3">
                      <FiBookOpen className="text-lg" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Google Books</h3>
                      <p className="text-slate-400 text-sm">Books and publications</p>
                    </div>
                  </motion.div>
                </Link>
                
                <Link href="https://www.ncbi.nlm.nih.gov/pmc/" target="_blank" rel="noopener noreferrer">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200 flex items-center"
                  >
                    <div className="h-10 w-10 bg-purple-600 rounded-full flex items-center justify-center text-white mr-3">
                      <FiFileText className="text-lg" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">PubMed Central</h3>
                      <p className="text-slate-400 text-sm">Free full-text archive</p>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </div>
            
            {/* Saved Searches */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-slate-700/50 overflow-hidden">
              <div className="p-4 bg-slate-800 border-b border-slate-700/50">
                <h2 className="text-xl font-bold text-white">Saved Searches</h2>
              </div>
              
              <div className="p-4">
                {savedQueries.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <FiBookmark className="text-3xl mx-auto mb-2" />
                    <p>No saved searches yet</p>
                    <p className="text-sm mt-1">Save searches for quick access later</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedQueries.map((query, index) => (
                      <div 
                        key={index}
                        className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg flex justify-between items-center"
                      >
                        <div className="truncate pr-2">
                          <p className="text-slate-300 truncate">{query}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button 
                            onClick={() => handleSearch(query)}
                            className="p-2 text-slate-300 hover:text-indigo-400 transition-colors duration-200"
                          >
                            <FiSearch />
                          </button>
                          <button 
                            onClick={() => removeQuery(index)}
                            className="p-2 text-slate-300 hover:text-red-400 transition-colors duration-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Recommended Resources Section */}
        <motion.div 
          className="mt-8 bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-slate-700/50 overflow-hidden"
          variants={itemVariants}
        >
          <div className="p-4 bg-slate-800 border-b border-slate-700/50">
            <h2 className="text-xl font-bold text-white">Recommended Resources for {selectedCategory}</h2>
            <p className="text-slate-400 text-sm">Pre-vetted, high-quality resources you can access directly</p>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedResources[selectedCategory].map((resource, index) => (
                <motion.a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200"
                >
                  <h3 className="text-white font-medium mb-2">{resource.title}</h3>
                  <p className="text-slate-400 text-sm">{resource.description}</p>
                  <div className="mt-3 flex items-center text-indigo-400 text-sm">
                    <FiExternalLink className="mr-1" /> Visit resource
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Additional Resources Section */}
        <motion.div 
          className="mt-8 bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-slate-700/50 p-6"
          variants={itemVariants}
        >
          <h2 className="text-xl font-bold text-white mb-4">Why Use Google Search for Mental Health Resources?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Accessibility</h3>
              <p className="text-slate-300 text-sm">
                Google's search tools are free and accessible to everyone with internet access, making it easy to find resources without specialized tools.
              </p>
            </div>
            
            <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Up-to-date Information</h3>
              <p className="text-slate-300 text-sm">
                Google indexes new content constantly, ensuring you have access to the most current research and resources in mental health.
              </p>
            </div>
            
            <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Diverse Resources</h3>
              <p className="text-slate-300 text-sm">
                Find a wide range of materials including academic papers, books, workbooks, videos, and practical guides all in one place.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Footer */}
      <motion.footer 
        className="mt-12 bg-slate-800/80 border-t border-slate-700/50 py-6"
        variants={itemVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm">
            Disclaimer: This tool provides access to educational resources only. It is not a substitute for professional mental health advice, diagnosis, or treatment.
          </p>
        </div>
      </motion.footer>
      
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
    </motion.div>
  );
} 