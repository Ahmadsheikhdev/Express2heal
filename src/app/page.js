"use client";

import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { FaArrowRight, FaComments, FaUsers, FaBook, FaUserCircle, FaChartLine } from "react-icons/fa";

// Feature Data
const features = [
  {
    name: "AI Conversations",
    description:
      "Have personalized one-on-one conversations with an AI designed to understand and support you.",
    video: "/aichatbot.mp4",
    link: "/ai-conversation",
    buttonText: "Learn More",
    icon: <FaComments className="text-4xl mb-4 text-blue-400" />,
    color: "from-blue-600 to-indigo-600",
  },
  {
    name: "Group Chat Support",
    description:
      "Connect with like-minded individuals and engage in meaningful group conversations, supported by AI moderation.",
    video: "/groupchat.mp4",
    link: "/groupchat",
    buttonText: "Start Group Chat",
    icon: <FaUsers className="text-4xl mb-4 text-green-400" />,
    color: "from-green-600 to-teal-600",
  },
  {
    name: "Journal Writing",
    description:
      "Express your thoughts and feelings through a secure, AI-assisted journaling feature.",
    video: "/journal.mp4",
    link: "/Journalpage",
    buttonText: "Start Writing",
    icon: <FaBook className="text-4xl mb-4 text-purple-400" />,
    color: "from-purple-600 to-pink-600",
  },
  {
    name: "View Progress",
    description:
      "Visualize your personal emotional journey with analytics and insights based on your journaling activity.",
    video: "/vpps.mp4",
    link: "/progress",
    buttonText: "Check Progress",
    icon: <FaChartLine className="text-4xl mb-4 text-teal-400" />,
    color: "from-teal-600 to-cyan-600",
  },
  {
    name: "Generate Profile",
    description:
      "Get a dynamically generated profile based on your interactions, mood data, and AI analysis.",
    video: "/gp.mp4",
    link: "/generate-profile",
    buttonText: "Generate Now",
    icon: <FaUserCircle className="text-4xl mb-4 text-yellow-400" />,
    color: "from-yellow-600 to-orange-600",
  },
];

export default function Home() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const [currentWord, setCurrentWord] = useState(0);
  const words = ["  CHAT ", "EXPRESS", "  HEAL "];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000); // Change word every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      {/* Particles Background */}
      <div className="fixed inset-0 z-0">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            background: {
              color: {
                value: "#0a192f",
              },
            },
            fpsLimit: 60,
            interactivity: {
              events: {
                onClick: {
                  enable: true,
                  mode: "push",
                },
                onHover: {
                  enable: true,
                  mode: "repulse",
                },
                resize: true,
              },
              modes: {
                push: {
                  quantity: 4,
                },
                repulse: {
                  distance: 200,
                  duration: 0.4,
                },
              },
            },
            particles: {
              color: {
                value: "#ffffff",
              },
              links: {
                color: "#ffffff",
                distance: 150,
                enable: true,
                opacity: 0.5,
                width: 1,
              },
              collisions: {
                enable: true,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: {
                  default: "bounce",
                },
                random: false,
                speed: 2,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  area: 800,
                },
                value: 80,
              },
              opacity: {
                value: 0.5,
              },
              shape: {
                type: "circle",
              },
              size: {
                value: { min: 1, max: 5 },
              },
            },
            detectRetina: true,
          }}
        />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow z-10 relative">
        {/* Landing Section */}
        <section className="flex flex-col items-center justify-center text-center min-h-screen relative px-4">
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/30 z-[-1]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          />
          
          <motion.div
            className="rounded-full bg-blue-500/20 p-8 backdrop-blur-sm mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: "spring" }}
          >
            <motion.img
              src="/logo.png"
              alt="Logo"
              width={250}
              height={250}
              className="drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
            />
          </motion.div>
          
          <motion.h2
            className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text drop-shadow-lg"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Your AI Companion
          </motion.h2>
          
          <motion.div
            className="text-white text-xl max-w-2xl mb-8 backdrop-blur-sm bg-blue-900/20 p-6 rounded-xl"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={currentWord}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="inline-block font-bold text-blue-300"
              >
                {words[currentWord]}
              </motion.span>
            </AnimatePresence>
            <span>, with an AI that's here to understand and support you.</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md"></div>
            <Link href="/ai-conversation" className="relative block">
              <button className="relative px-8 py-4 bg-white text-blue-600 rounded-full shadow-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 font-bold flex items-center gap-2">
                Get Started <FaArrowRight className="ml-1" />
              </button>
            </Link>
          </motion.div>
          
          <motion.div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <div className="animate-bounce text-white/70">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <div className="w-full bg-gradient-to-b from-blue-900 to-navy-900 relative">
          {/* Section Title */}
          <div className="text-center pt-20 pb-10">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Our <span className="text-blue-400">Features</span>
            </motion.h2>
            <motion.div 
              className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto"
              initial={{ width: 0 }}
              whileInView={{ width: 96 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            ></motion.div>
          </div>
          
          {/* Features */}
          {features.map((feature, index) => (
            <motion.section
              key={index}
              className={`min-h-screen flex flex-col md:flex-row ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              } items-center text-white px-6 py-20`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="w-full md:w-1/2 p-8">
                <motion.div
                  initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="mb-6"
                >
                  {feature.icon}
                  <h2 className={`text-4xl font-bold mb-4 bg-gradient-to-r ${feature.color} text-transparent bg-clip-text`}>
                    {feature.name}
                  </h2>
                  <div className={`w-20 h-1 bg-gradient-to-r ${feature.color} mb-6`}></div>
                  <p className="text-lg mb-8 text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                  <Link href={feature.link}>
                    <button className={`px-6 py-3 bg-gradient-to-r ${feature.color} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2`}>
                      {feature.buttonText} <FaArrowRight />
                    </button>
                  </Link>
                </motion.div>
              </div>
              
              <div className="w-full md:w-1/2 p-8">
                <motion.div
                  initial={{ x: index % 2 === 0 ? 50 : -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className={`absolute -inset-4 bg-gradient-to-r ${feature.color} rounded-2xl blur-md opacity-70`}></div>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <video autoPlay loop muted className="w-full h-auto object-cover rounded-2xl">
                      <source src={feature.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </motion.div>
              </div>
            </motion.section>
          ))}
        </div>
      </main>

      {/* Footer Section - with higher z-index and explicit styling */}
      <section className="relative z-50 bg-navy-900">
        <Footer />
      </section>
    </div>
  );
}