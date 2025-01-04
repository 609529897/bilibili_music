/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'bar-1': {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'bar-2': {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(0.3)' },
        },
        'bar-3': {
          '0%, 100%': { transform: 'scaleY(0.7)' },
          '50%': { transform: 'scaleY(0.4)' },
        }
      },
      animation: {
        'bar-1': 'bar-1 1.2s ease-in-out infinite',
        'bar-2': 'bar-2 1.2s ease-in-out infinite',
        'bar-3': 'bar-3 1.2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
