/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#845ADF',        // tím đậm
        'primary-light': '#916BE2', // tím sáng
        secondary: '#52347F',       // tím phụ
        border: '#B59CEC',          // tím nhạt
      }
    },
  },
  plugins: [],
}