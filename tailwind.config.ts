import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#f69c3bff", // Blue for light mode
          dark: "#fac960ff", // Lighter blue for dark mode
          accent: "#10b981",
        },
        background: {
          light: "#f9fafb", // Light background
          dark: "#222222", // Dark background
        },
        card: {
          light: "#ffffff",
          dark: "#374151",
        },
      },
    },
  },
  darkMode: "class", // Enable dark mode using class-based toggle
  plugins: [],
} satisfies Config;
