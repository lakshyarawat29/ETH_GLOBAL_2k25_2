/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'], // Google font
        satoshi: ['satoshi', 'sans-serif'], // local font
        jetbrains: ['JetBrains Mono', 'monospace'], // Google font
      },
  },
  
  plugins: [],
};
