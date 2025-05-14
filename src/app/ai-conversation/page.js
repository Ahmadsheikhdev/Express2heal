"use client";
import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import Navbar from "../../Components/Navbar";
import { motion } from "framer-motion";
import { FaMicrophone, FaMicrophoneSlash, FaPaperPlane, FaRobot, FaUser } from "react-icons/fa";
import Footer from "../../Components/Footer";
import { pipeline, env } from '@xenova/transformers';

// Configure the environment
env.allowRemoteModels = true;
env.useBrowserCache = true;
env.backends.onnx.wasm.wasmPaths = '/wasm/';

// Simple response templates for common queries
const SIMPLE_RESPONSES = {
  greeting: [
    "Hello! How can I help you today?",
    "Hi there! What's on your mind?",
    "Hello! I'm here to listen and support you."
  ],
  math: {
    "2+2": "The answer is 4.",
    "1+1": "The answer is 2.",
    "3+3": "The answer is 6."
  },
  fallback: [
    "I understand. Could you tell me more about that?",
    "That's interesting. How do you feel about it?",
    "I'm here to listen. Would you like to share more?"
  ]
};

export default function AIConversation() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const messagesEndRef = useRef(null);
  const [generator, setGenerator] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState(null);

  // Initialize the model
  useEffect(() => {
    const initModel = async () => {
      try {
        setModelError(null);
        // Load the model directly from Hugging Face Hub
        const textGenerator = await pipeline('text-generation', 'Xenova/distilgpt2', {
          quantized: true,
          progress_callback: (progress) => {
            console.log(`Loading model: ${Math.round(progress * 100)}%`);
          }
        });
        setGenerator(textGenerator);
        setIsModelLoading(false);
      } catch (error) {
        console.error('Error loading model:', error);
        setModelError('Failed to load AI model. Please refresh the page.');
        setIsModelLoading(false);
      }
    };

    initModel();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-700 to-navy-900 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-2xl text-white max-w-md text-center">
            <FaMicrophone className="text-5xl mb-4 text-red-400 mx-auto" />
            <h2 className="text-2xl font-bold mb-4">Speech Recognition Not Available</h2>
            <p>Speech recognition is not supported in this browser. Please use Chrome or another compatible browser.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getSimpleResponse = (input) => {
    const lowerInput = input.toLowerCase().trim();
    
    // Check for greetings
    if (lowerInput.match(/^(hi|hello|hey|greetings)/i)) {
      return SIMPLE_RESPONSES.greeting[Math.floor(Math.random() * SIMPLE_RESPONSES.greeting.length)];
    }
    
    // Check for math questions
    if (lowerInput.includes('+')) {
      const mathExpr = lowerInput.match(/\d+\+\d+/)?.[0];
      if (mathExpr && SIMPLE_RESPONSES.math[mathExpr]) {
        return SIMPLE_RESPONSES.math[mathExpr];
      }
    }
    
    return null;
  };

  const generateResponse = async (userInput) => {
    if (!generator) {
      if (modelError) {
        return "I'm having technical difficulties. Please try again later.";
      }
      return "I'm still loading my knowledge. Please wait a moment.";
    }

    try {
      // Check for simple responses first
      const simpleResponse = getSimpleResponse(userInput);
      if (simpleResponse) {
        return simpleResponse;
      }

      // Generate response using the model with improved parameters
      const result = await generator(userInput, {
        max_length: 150,
        num_return_sequences: 1,
        temperature: 0.8,
        top_p: 0.95,
        repetition_penalty: 1.5,
        do_sample: true,
        pad_token_id: generator.tokenizer.eos_token_id
      });

      // Extract the generated text
      let response = result[0].generated_text;
      
      // Remove the input text from the response
      response = response.slice(userInput.length).trim();
      
      // Clean up the response
      response = response.replace(/<|endoftext|>/g, '').trim();
      
      // If response is empty or too short, provide a fallback
      if (!response || response.length < 10) {
        return SIMPLE_RESPONSES.fallback[Math.floor(Math.random() * SIMPLE_RESPONSES.fallback.length)];
      }

      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      return SIMPLE_RESPONSES.fallback[Math.floor(Math.random() * SIMPLE_RESPONSES.fallback.length)];
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");
    resetTranscript();

    // Show typing indicator
    setIsTyping(true);

    try {
      // Generate AI response
      const aiResponse = await generateResponse(input);
      const aiMessage = { role: "ai", content: aiResponse };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in conversation:', error);
      const errorMessage = { role: "ai", content: "I'm having trouble right now. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
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
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-700 to-navy-900 flex flex-col">
      <Navbar />
      
      <motion.div 
        className="flex-grow flex flex-col items-center p-4 md:p-8 pt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="w-full max-w-4xl mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">AI Conversation</h1>
          <p className="text-blue-200 text-sm md:text-base">Share your thoughts and feelings in a safe, supportive space</p>
          {isModelLoading && (
            <p className="text-yellow-300 mt-2">Loading AI model... This may take a moment.</p>
          )}
          {modelError && (
            <p className="text-red-300 mt-2">{modelError}</p>
          )}
        </div>
        
        {/* Chat Container */}
        <motion.div 
          className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden flex flex-col flex-grow"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Messages Area */}
          <div className="flex-grow p-4 md:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent">
            <motion.div className="flex flex-col space-y-4" variants={containerVariants}>
              {messages.length === 0 ? (
                <motion.div 
                  className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4"
                  variants={itemVariants}
                >
                  <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <FaRobot className="text-4xl text-blue-300" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Welcome to Express2Heal</h2>
                  <p className="text-blue-200 max-w-md">
                    I'm here to listen and support you. Feel free to share whatever is on your mind.
                    Your conversation is private and safe.
                  </p>
                </motion.div>
              ) : (
                messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    variants={itemVariants}
                  >
                    <div className={`flex items-start max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.role === "user" ? "bg-blue-600 ml-2" : "bg-indigo-600 mr-2"
                      }`}>
                        {msg.role === "user" ? <FaUser className="text-xs text-white" /> : <FaRobot className="text-xs text-white" />}
                      </div>
                      <div className={`py-3 px-4 rounded-2xl ${
                        msg.role === "user" 
                          ? "bg-blue-600 text-white rounded-tr-none" 
                          : "bg-white/20 text-white rounded-tl-none"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div 
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start max-w-[80%]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 mr-2 flex items-center justify-center">
                      <FaRobot className="text-xs text-white" />
                    </div>
                    <div className="py-3 px-4 rounded-2xl bg-white/20 text-white rounded-tl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </motion.div>
          </div>
          
          {/* Input Area */}
          <div className="bg-white/20 backdrop-blur-md p-3 md:p-4 border-t border-white/20">
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleMicClick} 
                className={`p-3 rounded-full flex-shrink-0 transition-all duration-300 ${
                  listening 
                    ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                title={listening ? "Stop listening" : "Start voice input"}
              >
                {listening ? <FaMicrophoneSlash className="text-white" /> : <FaMicrophone className="text-white" />}
              </button>
              
              <div className="relative flex-grow">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full bg-white/10 text-white placeholder-blue-200 rounded-xl py-3 px-4 pr-12 outline-none focus:ring-2 focus:ring-blue-500 resize-none h-12 max-h-32 overflow-auto"
                  style={{ minHeight: "48px" }}
                />
                <button 
                  onClick={handleSend} 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors duration-300"
                  disabled={!input.trim() || isModelLoading}
                >
                  <FaPaperPlane className={`${!input.trim() || isModelLoading ? 'opacity-50' : ''}`} />
                </button>
              </div>
            </div>
            
            {listening && (
              <div className="mt-2 text-xs text-blue-200 text-center animate-pulse">
                Listening... {transcript ? `"${transcript}"` : ""}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      
      <Footer />
    </div>
  );
}
