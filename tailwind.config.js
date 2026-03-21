/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vibrant-blue': '#004aad', // Peacock Blue
        'vibrant-pink': '#e6005c', // Lotus Pink
        'vibrant-gold': '#ffcc00', // Temple Top Gold
        'vibrant-orange': '#ff6600', // Marigold
        'heritage-gold': '#D4AF37', // Antique Gold (Map borders & glow)
        'heritage-terracotta': '#C96A2E', // Temple Terracotta
        'glass-white': 'rgba(255, 255, 255, 0.1)',
        'glass-black': 'rgba(0, 0, 0, 0.6)',
        'bg-dark': '#0f0f1a', // Deep Night Sky
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Syne', 'serif'], // Modern display serif
        heading: ['Clash Display', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=2670&auto=format&fit=crop')", // Chennai Temple
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 204, 0, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 204, 0, 0.8)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        float: 'float 6s ease-in-out infinite',
        glow: 'glow 3s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        gradient: 'gradient 3s ease infinite',
        marquee: 'marquee 20s linear infinite',
      },
    },
  },
  plugins: [],
}
