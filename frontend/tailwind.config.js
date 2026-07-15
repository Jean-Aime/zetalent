/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FFFDF5',
          100: '#FFF8E1',
          200: '#FFEDB3',
          300: '#FFE080',
          400: '#F4B400',
          500: '#E0A300',
          600: '#B88600',
          700: '#8C6500',
          800: '#5E4400',
          900: '#3D2C00',
        },
        ink: {
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#C9C9C9',
          300: '#A0A0A0',
          400: '#6B6B6B',
          500: '#3D3D3D',
          600: '#2A2A2A',
          700: '#1C1C1C',
          800: '#121212',
          900: '#0A0A0A',
          950: '#050505',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'slide-right': 'slideRight 0.8s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
        'ticker': 'ticker 40s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'glow': 'glow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(244,180,0,0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(244,180,0,0.35)' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F4B400 0%, #E0A300 100%)',
        'gold-shimmer': 'linear-gradient(90deg, #E0A300 0%, #F4B400 50%, #E0A300 100%)',
        'radial-gold': 'radial-gradient(circle at 50% 0%, rgba(244,180,0,0.12), transparent 60%)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
