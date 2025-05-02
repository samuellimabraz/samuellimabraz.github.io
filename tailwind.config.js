/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        dark: {
          primary: '#0C0F19',
          secondary: '#161A2C',
          tertiary: '#1F2336',
          accent: '#6D77F6',
          text: {
            primary: '#E6E8F0',
            secondary: '#A0A3B1',
            accent: '#7D82F0'
          },
          border: '#2A2F45'
        }
      },
      animation: {
        'matrix-flow': 'matrix-flow 10s linear infinite',
        'connection-pulse': 'connection-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        'matrix-flow': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(500px)' },
        },
        'connection-pulse': {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.8 },
        },
      },
    },
  },
  plugins: [],
};