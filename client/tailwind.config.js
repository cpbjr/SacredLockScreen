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
        display: ['Cinzel', 'serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(212, 168, 83, 0.3)',
        'glow-md': '0 0 20px rgba(212, 168, 83, 0.4)',
        'glow-lg': '0 0 30px rgba(212, 168, 83, 0.5)',
        'glow-xl': '0 0 40px rgba(212, 168, 83, 0.6)',
        'glow-golden': '0 0 25px rgba(212, 168, 83, 0.5), 0 0 50px rgba(212, 168, 83, 0.2)',
        'glow-radial': '0 0 60px rgba(212, 168, 83, 0.4), 0 0 100px rgba(212, 168, 83, 0.2)',
      },
      backgroundImage: {
        'radial-warm': 'radial-gradient(ellipse at center, #FAF9F7 0%, #F5F1E8 40%, #EDE6D4 100%)',
        'radial-golden': 'radial-gradient(ellipse at top center, rgba(255, 249, 230, 0.8) 0%, rgba(212, 168, 83, 0.3) 50%, rgba(250, 249, 247, 0) 100%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)', opacity: '0.3' },
          '25%': { transform: 'translateY(-20px) translateX(10px)', opacity: '0.6' },
          '50%': { transform: 'translateY(-10px) translateX(-10px)', opacity: '0.4' },
          '75%': { transform: 'translateY(-25px) translateX(5px)', opacity: '0.5' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 10px rgba(212, 168, 83, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 25px rgba(212, 168, 83, 0.8))' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
