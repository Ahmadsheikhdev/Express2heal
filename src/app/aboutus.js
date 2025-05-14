// src/pages/about.js
export default function AboutUs() {
    return (
      <div className="bg-gray-100 min-h-screen">
        <header className="bg-gray-800 text-white py-8 text-center">
          <h1 className="text-3xl font-bold">About Us</h1>
        </header>
        <main className="container mx-auto p-6">
          <p className="text-gray-700 leading-relaxed text-lg">
            Welcome to Express2Heal! We are dedicated to providing a seamless platform for group communication,
            AI-powered interactions, and journaling. Our mission is to foster meaningful connections and empower users
            with advanced tools for collaboration and personal growth.
          </p>
          <p className="mt-4 text-gray-700">
            Our team is committed to excellence, constantly innovating to create an exceptional user experience.
            Whether you want to chat with your group, engage in AI-driven conversations, or reflect through journaling,
            Express2Heal is here for you.
          </p>
        </main>
      </div>
    );
  }
  