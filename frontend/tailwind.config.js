/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'docker-blue': '#1D63ED',
        'docker-dark': '#0a0f1e',
        'docker-surface': '#0d1526',
        'docker-card': '#111827',
        'docker-border': 'rgba(59, 130, 246, 0.15)',
        'docker-muted': '#8b9cb6',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(29, 99, 237, 0.5), 0 0 20px rgba(29, 99, 237, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(29, 99, 237, 0.8), 0 0 40px rgba(29, 99, 237, 0.5)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'fadeInUp': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'typewriter': {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'marquee': 'marquee 20s linear infinite',
        'fadeInUp': 'fadeInUp 0.8s ease-out forwards',
        'typewriter': 'typewriter 2s steps(40) forwards',
      },
    },
  },
  plugins: [],
}
