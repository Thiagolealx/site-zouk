/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: '#0E2A32',
          light: '#163B45',
          deep: '#081A1F',
        },
        sun: {
          yellow: '#FFB627',
          orange: '#F2761E',
        },
        coral: '#FF5A6E',
        sand: '#FDF6EC',
      },
      fontFamily: {
        display: ['"Anton"', 'sans-serif'],
        body: ['"Work Sans"', 'sans-serif'],
        script: ['"Caveat"', 'cursive'],
      },
      backgroundImage: {
        'sunset-gradient': 'linear-gradient(135deg, #FFB627 0%, #F2761E 55%, #FF5A6E 100%)',
      },
    },
  },
  plugins: [],
}
