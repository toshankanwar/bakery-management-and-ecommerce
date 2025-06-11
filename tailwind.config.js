/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        animation: {
          loading: 'loading 1s ease-in-out infinite',
        },
        keyframes: {
          loading: {
            '0%': {
              transform: 'translateX(-100%)',
            },
            '100%': {
              transform: 'translateX(100%)',
            },
          },
        },
      },
    },
    plugins: [],
  };