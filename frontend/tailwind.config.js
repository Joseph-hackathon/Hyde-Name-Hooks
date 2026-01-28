/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFBFD', // Off-white/Cream background
        brand: {
          blue: '#3889FF',
          dark: '#191E28',
        },
        pastel: {
          blue: '#EBF4FF',    // Light Blue section
          pink: '#FCE7F3',    // Light Pink section
          green: '#E6F6ED',   // Light Green section
          yellow: '#FFFBEB',
        },
        card: {
          blue: '#D2EAFF',
          pink: '#FFD6EB',
          green: '#D1F0E0',
        },
        sticker: {
          uni: '#FFD6EB',
          base: '#FFF9C2',
          linea: '#D1F0E0',
          vitalik: '#FF6388', // Bright Pink
          cbox: '#00B14F',    // Celo Green
        }
      },
      fontFamily: {
        sans: ['Roboto', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'], // For big headers
      },
      backgroundImage: {
        'search-gradient': 'linear-gradient(90deg, #EBF4FF 0%, #F5F3FF 100%)',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'search': '0 0 0 1px rgba(0,0,0,0.05), 0 10px 30px -10px rgba(0,0,0,0.1)',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-medium': 'float 6s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(2deg)' },
          '66%': { transform: 'translateY(5px) rotate(-1deg)' },
        }
      }
    },
  },
  plugins: [],
}
