/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D4A853',
          hover: '#C49943',
        },
        secondary: '#E8DCC8',
        navy: '#1A2332',
        charcoal: '#374151',
        stone: {
          DEFAULT: '#6B7280',
          light: '#D1D5DB',
        },
        surface: '#FFFFFF',
        page: '#FAF9F7',
        teal: {
          DEFAULT: '#2A7B8C',
          hover: '#1F5A68',
          light: '#E6F3F5',
        },
        coral: {
          DEFAULT: '#E8A07A',
          light: '#FDF4EF',
        },
        success: {
          DEFAULT: '#4A8C5E',
          light: '#EDF7F0',
        },
        error: {
          DEFAULT: '#C45C5C',
          light: '#FDF2F2',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
