/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ink: '#000000', bone: '#ffffff' },
      fontFamily: {
        display: ['Assistant', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        sans: ['Assistant', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
