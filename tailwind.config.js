//tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}',
    './src/lib/**/*.{html,js,svelte,ts}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#eef2ff',
          100: '#e0e7ff', 
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}