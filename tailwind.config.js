/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#04091a',
          900: '#080f24',
          850: '#0c1530',
          800: '#101c3a',
          700: '#162247',
          600: '#1d2f5e',
        },
        brand: {
          cyan: '#00b8d4',
          'cyan-light': '#00e5ff',
          orange: '#f5a623',
          'orange-dark': '#e08c00',
          blue: '#1a4b8f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        hebrew: ['Arial', 'Helvetica', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
