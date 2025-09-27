/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          primary: '#1e40af',
          secondary: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          light: '#f8fafc',
          dark: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}