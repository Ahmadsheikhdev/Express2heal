/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
	  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
	  extend: {
		// Existing color settings retained
		colors: {
		  background: "var(--background)",
		  foreground: "var(--foreground)",
		  // Add new color palettes here (e.g., shades for buttons, backgrounds, text)
		  primary: "#3b82f6", // Blue shade
		  secondary: "#4f46e5", // Purple shade
		  accent: "#22d3ee", // Cyan accent
		},
		// Add gradient-related utilities
		gradientColorStops: {
		  "blue-start": "#3b82f6",
		  "blue-end": "#4f46e5",
		},
		// Add box-shadow utilities
		boxShadow: {
		  card: "0 4px 20px rgba(0, 0, 0, 0.1)", // For forms/cards
		  nav: "0 2px 10px rgba(0, 0, 0, 0.05)", // Subtle nav shadow
		},
		// Add animation and transition utilities
		animation: {
		  fadeIn: "fadeIn 0.5s ease-in-out",
		  slideUp: "slideUp 0.6s ease-in-out",
		},
		keyframes: {
		  fadeIn: {
			"0%": { opacity: 0 },
			"100%": { opacity: 1 },
		  },
		  slideUp: {
			"0%": { transform: "translateY(100%)", opacity: 0 },
			"100%": { transform: "translateY(0)", opacity: 1 },
		  },
		},
	  },
	},
	plugins: [
	  // Add Tailwind CSS plugins for typography, forms, and animations
	  require('@tailwindcss/forms'), // Better form styling
	  require('@tailwindcss/typography'), // Advanced typography utilities
	  require('@tailwindcss/aspect-ratio'), // Aspect ratio utilities
	],
  };
  