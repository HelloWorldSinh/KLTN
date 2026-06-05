export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#0f766e',
          light: '#14b8a6',
          dark: '#115e59',
        },
        secondary: {
          DEFAULT: '#f8fafc', 
          dark: '#e2e8f0'
        }
      }
    },
  },
  plugins: [],
}
