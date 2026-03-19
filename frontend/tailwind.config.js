/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#08060F',
        bg2:     '#0F0B1E',
        bg3:     '#151126',
        bg4:     '#1C1730',
        border:  '#28184A',
        border2: '#382460',
        cyan:    '#F72585',
        cyan2:   '#BE185D',
        orange:  '#F59E0B',
        muted:   '#6D5B9A',
        muted2:  '#3D2E65',
        green:   '#00FF9F',
        red:     '#FF3B5C',
      },
      fontFamily: {
        display:   ['"Bebas Neue"', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'sans-serif'],
        body:      ['Barlow', 'sans-serif'],
        mono:      ['"Share Tech Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
