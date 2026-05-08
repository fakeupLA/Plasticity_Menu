/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:    { DEFAULT: '#1a1a1a', 2: '#232323', 3: '#2c2c2c', 4: '#353535' },
        line:  { DEFAULT: '#3a3a3a', 2: '#4a4a4a' },
        ink:   { DEFAULT: '#e8e8e8', 2: '#a8a8a8', 3: '#6a6a6a' },
        accent:{ DEFAULT: '#ff6b35', 2: '#ff8557' },
        ok:    '#6bcf7f',
        warn:  '#f4b942',
        danger:'#e85d5d',
        socket:{ DEFAULT: '#2a2a2a', empty: '#1f1f1f', stroke: '#444' },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SF Mono', 'Cascadia Mono', 'monospace'],
      },
      borderRadius: { sm: '3px', DEFAULT: '4px', md: '6px', lg: '8px' },
    },
  },
  plugins: [],
};
