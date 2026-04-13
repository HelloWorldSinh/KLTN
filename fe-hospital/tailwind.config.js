export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0056b3',
          light: '#3380cc',
          dark: '#004085',
        },
        secondary: {
          DEFAULT: '#f3f4f6', 
          dark: '#e5e7eb'
        }
      }
    },
  },
  plugins: [],
}
