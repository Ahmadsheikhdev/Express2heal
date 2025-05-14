// src/pages/contact.js
export default function ContactUs() {
    return (
      <div className="bg-gray-100 min-h-screen">
        <header className="bg-gray-800 text-white py-8 text-center">
          <h1 className="text-3xl font-bold">Contact Us</h1>
        </header>
        <main className="container mx-auto p-6">
          <p className="text-gray-700 mb-6">
            We’d love to hear from you! Feel free to reach out to us through the form below or via email.
          </p>
          <form className="space-y-4 max-w-lg mx-auto">
            <div>
              <label className="block text-gray-600 mb-1">Name</label>
              <input type="text" className="w-full border border-gray-300 p-2 rounded" placeholder="Your Name" />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Email</label>
              <input type="email" className="w-full border border-gray-300 p-2 rounded" placeholder="Your Email" />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Message</label>
              <textarea className="w-full border border-gray-300 p-2 rounded" placeholder="Your Message"></textarea>
            </div>
            <button type="submit" className="bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700">
              Send Message
            </button>
          </form>
        </main>
      </div>
    );
  }
  