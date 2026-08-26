/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* CraveKart dark palette */
        dark: {
          50:  '#f5f5f5',
          100: '#e0e0e0',
          200: '#c2c2c2',
          300: '#9e9e9e',
          400: '#6b6b6b',
          500: '#3d3d3d',
          600: '#2a2a2a',
          700: '#1e1e1e',
          800: '#141414',
          900: '#0a0a0a',
          950: '#050505',
        },
        /* CraveKart accent */
        crave: {
          50:  '#fff8f0',
          100: '#ffecd6',
          200: '#ffd4a8',
          300: '#ffb470',
          400: '#ff8c35',
          500: '#ff6b00',   /* primary orange */
          600: '#e55a00',
          700: '#c44a00',
          800: '#a03c00',
          900: '#7d3000',
        },
        /* Warm amber accent */
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
      boxShadow: {
        'glow-orange': '0 0 24px rgba(255,107,0,0.45)',
        'glow-sm':     '0 0 12px rgba(255,107,0,0.25)',
        'card-dark':   '0 4px 24px rgba(0,0,0,0.5)',
        'card-hover':  '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,107,0,0.2)',
        'glass':       '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'elevated':    '0 20px 60px rgba(0,0,0,0.6)',
        'navbar':      '0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a0f00 50%, #0a0a0a 100%)',
        'orange-radial': 'radial-gradient(ellipse at center, rgba(255,107,0,0.15) 0%, transparent 70%)',
        'card-gradient': 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.9) 100%)',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'float':        'float 3s ease-in-out infinite',
        'slide-up':     'slide-up 0.5s ease-out both',
        'fade-in':      'fade-in 0.4s ease-out both',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'scale-in':     'scale-in 0.3s ease-out both',
      },
    },
  },
  plugins: [],
}
