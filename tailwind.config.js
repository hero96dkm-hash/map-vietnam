/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        edu: {
          green: {
            light: "#86efac",
            DEFAULT: "#22c55e",
            dark: "#15803d",
          },
          blue: {
            light: "#93c5fd",
            DEFAULT: "#3b82f6",
            dark: "#1d4ed8",
            ocean: "#0ea5e9"
          },
          yellow: {
            light: "#fde047",
            DEFAULT: "#eab308",
            dark: "#a16207",
            gold: "#f59e0b"
          },
          red: {
            light: "#fca5a5",
            DEFAULT: "#ef4444",
            dark: "#b91c1c"
          },
          pastel: {
            mint: "#e6fffa",
            sky: "#f0f9ff",
            amber: "#fefce8",
            rose: "#fff1f2"
          }
        }
      },
      fontFamily: {
        sans: ['Nunito', 'Quicksand', 'Inter', 'sans-serif'],
      },
      animation: {
        'bounce-short': 'bounce 0.8s ease-in-out 1',
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gentle-shake': 'gentleShake 0.4s ease-in-out',
        'gentle-pulse': 'gentlePulse 2s ease-in-out infinite',
        'float': 'float 3.5s ease-in-out infinite',
      },
      keyframes: {
        gentleShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        gentlePulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      },
      boxShadow: {
        'glow-yellow': '0 0 20px rgba(245, 158, 11, 0.6)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.6)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.6)',
      }
    },
  },
  plugins: [],
}
