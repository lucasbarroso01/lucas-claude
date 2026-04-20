/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'racing-red': '#E8002D',
        'racing-blue': '#0033A0',
        'racing-dark': '#050810',
        'racing-mid': '#0A1628',
        'racing-light': '#1A2A4A',
        'racing-chrome': '#C8D8E8',
        'racing-gray': '#8A9AB0',
        'racing-gold': '#B8860B',
        'racing-green': '#00A651',
        'racing-yellow': '#FFD700',
      },
    },
  },
  plugins: [],
}
