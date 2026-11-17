/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          950: '#230408',
          900: '#3B080F', // Main background
          850: '#4A0B14',
          800: '#590D19', // Dark burgundy envelope
          700: '#751322',
          600: '#941B2D',
          500: '#B0263C',
          text: '#54232B', // Rich romantic letter text
        },
        cream: {
          50: '#FDFAF4',
          100: '#F9F4E8',
          200: '#F2E3C3', // Main cream paper
          300: '#EAD1A0',
          400: '#DFC285',
        },
        vintageGold: {
          light: '#F5E4C4',
          DEFAULT: '#D5B47A',
          dark: '#A68449',
          border: '#C49F60',
        },
        wax: {
          DEFAULT: '#881324',
          highlight: '#B8283E',
          shadow: '#4F0813',
          gold: '#D4AF37',
        }
      },
      fontFamily: {
        amiri: ['"Amiri"', 'serif'],
        noto: ['"Noto Naskh Arabic"', 'serif'],
        aref: ['"Aref Ruqaa"', 'serif'],
        reem: ['"Reem Kufi"', 'sans-serif'],
      },
      boxShadow: {
        'envelope': '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 10px 25px -5px rgba(89, 13, 25, 0.4)',
        'letter': '0 20px 50px rgba(0, 0, 0, 0.45), 0 0 40px rgba(213, 180, 122, 0.15)',
        'seal': '0 8px 20px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -3px 5px rgba(0,0,0,0.5)',
        'polaroid': '0 15px 35px rgba(0, 0, 0, 0.4), 0 5px 15px rgba(0, 0, 0, 0.25)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.08)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      animation: {
        'float-slow': 'float 5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'shimmer': 'shimmer 6s linear infinite',
      }
    },
  },
  plugins: [],
}
