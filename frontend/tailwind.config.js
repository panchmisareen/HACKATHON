/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Hogwarts House Palettes
        ravenclaw: {
          bg: '#030712', // Void night blue
          surface: '#0B132B',
          card: '#0E1A38',
          border: '#3A506B',
          accent: '#38BDF8', // Celestial electric blue
          silver: '#E2E8F0', // Luminescent silver
          glow: 'rgba(56, 189, 248, 0.4)',
        },
        slytherin: {
          bg: '#06140D', // Deep serpent dungeon
          surface: '#0D2418',
          card: '#122E20',
          border: '#2D4A3A',
          accent: '#10B981', // Ancient emerald flame
          silver: '#CBD5E1', // Polished silver
          glow: 'rgba(16, 185, 129, 0.4)',
        },
        gryffindor: {
          bg: '#0F0C08', // Deep charcoal espresso leather
          surface: '#1A1410',
          card: '#241B15',
          border: '#4A3525',
          accent: '#991B1B', // Crimson red
          gold: '#D97706', // Burnished gold
          bronze: '#B45309',
          glow: 'rgba(217, 119, 6, 0.4)',
        },
        hufflepuff: {
          bg: '#12100E', // Rich espresso earth
          surface: '#1C1814',
          card: '#27221C',
          border: '#574220',
          accent: '#F59E0B', // Warm honey gold
          sage: '#10B981', // Greenhouse sage leaf
          glow: 'rgba(245, 158, 11, 0.4)',
        },
        patronus: {
          bg: '#051014', // Forbidden forest midnight teal
          surface: '#0A1B22',
          card: '#0E2732',
          border: '#164E63',
          accent: '#22D3EE', // Patronus ethereal glow
          silver: '#94A3B8', // Frost silver
          glow: 'rgba(34, 211, 238, 0.4)',
        },
        silver: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#12372A',
          950: '#052e16',
        },
        greentech: {
          bg: '#050806',
          surface: '#0B120E',
          card: '#0D1711',
          border: 'rgba(52, 211, 153, 0.15)',
          neon: '#00FF87',
          mint: '#6EE7B7',
          emerald: '#10B981',
          lime: '#A3E635',
          cyan: '#2DD4BF',
        },
        lime: {
          accent: '#D9F99D',
          bright: '#A3E635',
        },
        sage: {
          light: '#E8F5E9',
          DEFAULT: '#C8DFC8',
          dark: '#A5C5A5',
        },
        eco: {
          bg: '#F8FAF6',
          surface: '#FFFFFF',
          border: '#D9E4D0',
          text: '#1C2615',
          muted: '#4B5E39',
          green: '#15803D',
          'green-dark': '#1C2615',
          'green-light': '#EDF2E8',
          accent: '#10B981',
          olive: '#5C7348',
        },
        midnight: {
          950: '#030712',
          900: '#060D1F',
          800: '#0B1636',
          700: '#0F1E40',
          600: '#142550',
          card: '#0A132C',
          surface: '#0B1736',
          border: 'rgba(56, 189, 248, 0.18)',
        },
        olive: {
          50: '#F8FAF6',
          100: '#EDF2E8',
          200: '#D9E4D0',
          300: '#BCCFB0',
          400: '#8FA87D',
          500: '#5C7348',
          600: '#4B5E39',
          700: '#3B4B2D',
          800: '#2B3821',
          900: '#1C2615',
          950: '#121B0C',
        },
        neon: {
          pink: '#FF1493',
          red: '#FF3366',
          yellow: '#FFE600',
          cyan: '#00F0FF',
          lime: '#39FF14',
          purple: '#BD00FF',
          orange: '#FF6B00',
        }
      },
      fontFamily: {
        magical: ['Cinzel', 'serif'],
        ancient: ['Cinzel Decorative', 'Cinzel', 'serif'],
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Cinzel', 'Space Grotesk', 'Plus Jakarta Sans', 'serif'],
        tech: ['Space Grotesk', 'monospace', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'eco': '0 1px 3px rgba(18, 55, 42, 0.08), 0 1px 2px rgba(18, 55, 42, 0.04)',
        'eco-md': '0 4px 6px rgba(18, 55, 42, 0.07), 0 2px 4px rgba(18, 55, 42, 0.05)',
        'eco-lg': '0 10px 15px rgba(18, 55, 42, 0.08), 0 4px 6px rgba(18, 55, 42, 0.05)',
        'neon': '0 0 20px rgba(0, 255, 135, 0.4), 0 0 40px rgba(0, 255, 135, 0.15)',
        'neon-lg': '0 0 35px rgba(0, 255, 135, 0.5), 0 0 70px rgba(16, 185, 129, 0.25)',
        'silver-glow': '0 0 15px rgba(226, 232, 240, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        'patronus': '0 0 25px rgba(56, 189, 248, 0.35), 0 0 60px rgba(34, 211, 238, 0.15)',
        'emerald-magic': '0 0 20px rgba(16, 185, 129, 0.35), inset 0 1px 1px rgba(203, 213, 225, 0.15)',
        'gold-brazier': '0 0 25px rgba(217, 119, 6, 0.4), 0 0 50px rgba(153, 27, 27, 0.2)',
        'card': '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'card-hover': '0 8px 30px rgba(56, 189, 248, 0.2), inset 0 1px 0 rgba(226, 232, 240, 0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 1.5s ease-in-out infinite',
        'float-slow': 'floatSlow 4s ease-in-out infinite',
        'radar-spin': 'radarSpin 6s linear infinite',
        'candle-flicker': 'candleFlicker 1.8s ease-in-out infinite alternate',
        'patronus-wisp': 'patronusWisp 3s ease-in-out infinite',
        'stardust-drift': 'stardustDrift 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: 0, transform: 'translateY(-8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 0.95, transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        radarSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        candleFlicker: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1) rotate(-1deg)' },
          '25%': { opacity: '1', transform: 'scale(1.08) rotate(1deg)' },
          '50%': { opacity: '0.82', transform: 'scale(0.96) rotate(-0.5deg)' },
          '75%': { opacity: '0.97', transform: 'scale(1.04) rotate(0.8deg)' },
        },
        patronusWisp: {
          '0%, 100%': { opacity: '0.7', filter: 'drop-shadow(0 0 10px #38BDF8)' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 25px #22D3EE)' },
        },
        stardustDrift: {
          '0%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
          '100%': { transform: 'translateY(0px) rotate(360deg)' },
        },
      },
      backgroundImage: {
        'gradient-midnight': 'linear-gradient(135deg, #030712 0%, #0B132B 50%, #081026 100%)',
        'gradient-emerald-silver': 'linear-gradient(135deg, #06140D 0%, #0D2418 50%, #122E20 100%)',
        'gradient-gryffindor': 'linear-gradient(135deg, #0F0C08 0%, #1A1410 50%, #2B160F 100%)',
        'gradient-silver': 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 50%, #94A3B8 100%)',
        'gradient-patronus': 'linear-gradient(135deg, #051014 0%, #0A1B22 50%, #164E63 100%)',
      },
    },
  },
  plugins: [],
}
