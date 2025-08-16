

// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         // Cyber Genesis Color Palette
//         primary: {
//           50: '#f3f1ff',
//           100: '#e8e3ff',
//           200: '#d4caff',
//           300: '#b8a3ff',
//           400: '#9575ff',
//           500: '#8B5FBF', // Bright Purple - Interactive elements
//           600: '#7a52a8',
//           700: '#6b4691',
//           800: '#5c3b7a',
//           900: '#4d3064',
//         },
//         secondary: {
//           50: '#f0fffe',
//           100: '#ccfffc',
//           200: '#99fff9',
//           300: '#66fff6',
//           400: '#39FFCC', // Neon Cyan - Success states
//           500: '#00e6b8',
//           600: '#00cc9f',
//           700: '#00b386',
//           800: '#00996d',
//           900: '#008054',
//         },
//         accent: {
//           50: '#f0fcff',
//           100: '#ccf7ff',
//           200: '#99efff',
//           300: '#66e7ff',
//           400: '#33dfff',
//           500: '#00D9FF', // Electric Blue - CTAs and links
//           600: '#00c2e6',
//           700: '#00abcc',
//           800: '#0094b3',
//           900: '#007d99',
//         },
//         background: '#2D1B69', // Deep Purple - Primary background
//         surface: '#1A0B3D', // Dark Violet - Header/footer backgrounds
//         foreground: '#ffffff',
//         border: '#475569',
//         // Custom colors for specific use
//         'electric-blue': '#00D9FF',
//         'neon-cyan': '#39FFCC',
//         'deep-purple': '#2D1B69',
//         'dark-violet': '#1A0B3D',
//         'bright-purple': '#8B5FBF',
//       },
//     },
//   },
//   plugins: [],
// }


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Theme Color Palette (matching the image)
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b', // Slate gray for subtle elements
          600: '#475569',
          700: '#334155',
          800: '#1e293b', // Dark slate for cards
          900: '#0f172a', // Deep dark for backgrounds
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Green for success states
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Vibrant blue - main accent (matches image)
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        background: '#0f172a', // Deep dark background
        surface: '#1e293b', // Dark slate for surfaces
        foreground: '#ffffff', // Pure white text
        border: '#475569', // Subtle borders
        muted: {
          300: '#94a3b8', // Light muted text
          400: '#64748b', // Medium muted text
          500: '#475569', // Dark muted text
        },
        // Custom utility colors matching the image theme
        'electric-blue': '#3b82f6',
        'neon-blue': '#60a5fa',
        'deep-dark': '#0f172a',
        'dark-slate': '#1e293b',
        'slate-border': '#475569',
        'success-green': '#22c55e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(59, 130, 246, 0.3)',
        'glow-md': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-lg': '0 0 30px rgba(59, 130, 246, 0.5)',
        'success-glow': '0 0 20px rgba(34, 197, 94, 0.4)',
        'dark': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
