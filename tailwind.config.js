/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./sites.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#7B2FF7',
        'primary-dark': '#5A1DB8',
        'background-light': '#f9fafb',
        'background-dark': '#0a0a0c',
        'card-dark': '#18181f',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
