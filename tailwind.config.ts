import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        table: {
          DEFAULT: '#0B3D2E', // feutrine vert bouteille
          dark: '#072a20',
          light: '#12543f',
        },
        bordeaux: '#3D0B1F',
        gold: {
          DEFAULT: '#D4AF37',
          soft: '#E8CE7A',
          deep: '#A8842A',
        },
        cream: '#F2EFE9',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Oswald', 'Arial Narrow', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        felt: 'inset 0 0 120px rgba(0,0,0,0.55)',
        die: '0 12px 24px -6px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.4)',
        gold: '0 0 0 1px rgba(212,175,55,0.4), 0 8px 30px -8px rgba(212,175,55,0.35)',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,175,55,0.5)' },
          '50%': { boxShadow: '0 0 0 12px rgba(212,175,55,0)' },
        },
      },
      animation: {
        'pulse-gold': 'pulse-gold 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
