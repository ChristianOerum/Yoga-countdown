/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./public/**/*.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
      extend: {
        fontFamily: {
          'bold': ["bubbles-bold"],
          'black': ["bubbles-black"],
          'medium': ["bubbles-medium"],
          'semibold': ["bubbles-semibold"],
          'normal': ["bubbles-regular"],
        }
      },
    },
    plugins: [],
  }