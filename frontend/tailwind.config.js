/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#080C10',
        bg2:     '#0D1219',
        bg3:     '#111820',
        bg4:     '#161F2A',
        border:  '#1E2D3D',
        border2: '#243545',
        cyan:    '#00E5FF',
        cyan2:   '#00B8D4',
        orange:  '#FF6B00',
        muted:   '#5A7A94',
        muted2:  '#3D5870',
        green:   '#00FF87',
        red:     '#FF3B5C',
      },
      fontFamily: {
        condensed: ['"Barlow Condensed"', 'sans-serif'],
        body:      ['Barlow', 'sans-serif'],
        mono:      ['"Share Tech Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
