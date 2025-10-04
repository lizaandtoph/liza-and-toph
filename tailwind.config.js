/** @type {import('tailwindcss').Config} */
export default {
  content: ["./client/index.html", "./client/src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        olive: '#4A5942',
        ochre: '#CE8923',
        burnt: '#D25E1B',
        ivory: '#FFF9ED',
        espresso: '#412B15',
        blush: '#D89B85',
        maroon: '#63212E',
        sand: '#E2C48F',
        slateblue: '#728888',
      },
      borderRadius: {
        DEFAULT: '1.3rem',
      },
    },
  },
  plugins: [],
}
