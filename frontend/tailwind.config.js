module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eclairia-dark': '#081134',
        'eclairia-blue': '#0A1D60',
        'eclairia-pink': '#FF4775',
        'eclairia-red': '#F10F47',
        'eclairia-light': '#F1EDE1',
        'eclairia-gray': '#868276',
        'eclairia-dark-gray': '#1B170B',
        'eclairia-purple': '#590083',
        'eclairia-green': '#11C54D',
        'eclairia-yellow': '#D5B100',
        'eclairia-controls': '#09174C',
        'eclairia-controls-blue': '#0B2580',
      },
      fontFamily: {
        'abc-whyte': ['ABC Whyte', 'system-ui', 'sans-serif'],
        'figtree': ['Figtree', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
