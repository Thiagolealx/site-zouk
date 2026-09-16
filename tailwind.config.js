/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: '#0E2A30',
          light: '#12333A',
          deep: '#0B2328',
          hover: '#17383F',
        },
        sun: {
          yellow: '#FBBF3C',
          orange: '#F2761E',
        },
        coral: '#FB6A55',
        sand: '#FFF7E8',
        // Tons de apoio do design: contorno de card, régua entre seções
        // e os dois cinzas de texto secundário.
        line: '#1F444C',
        rule: '#16363D',
        mist: '#B9CDD1',
        haze: '#9FB8BD',
      },
      fontFamily: {
        display: ['"Anton"', 'sans-serif'],
        body: ['"Barlow"', 'sans-serif'],
        script: ['"Caveat"', 'cursive'],
      },
      backgroundImage: {
        'sunset-gradient': 'linear-gradient(95deg, #FBBF3C, #FB6A55)',
        'hero-glow': 'radial-gradient(120% 90% at 50% 0%, #2A3A2E 0%, #0E2A30 62%)',
      },
    },
  },
  plugins: [],
}
