/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#f472b6',
          dark: '#db2777'
        }
      }
    }
  },
  plugins: []
};

