// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         primary: {
//           50: '#eff6ff',
//           100: '#dbeafe',
//           500: '#3b82f6',
//           600: '#2563eb',
//           700: '#1d4ed8',
//         },
//         secondary: {
//           50: '#f8fafc',
//           100: '#f1f5f9',
//           500: '#64748b',
//           600: '#475569',
//         },
//         background: '#f9fafb',
//         foreground: '#111827',
//         border: '#e5e7eb',
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
        // Cyber Genesis Color Palette
        primary: {
          50: '#f3f1ff',
          100: '#e8e3ff',
          200: '#d4caff',
          300: '#b8a3ff',
          400: '#9575ff',
          500: '#8B5FBF', // Bright Purple - Interactive elements
          600: '#7a52a8',
          700: '#6b4691',
          800: '#5c3b7a',
          900: '#4d3064',
        },
        secondary: {
          50: '#f0fffe',
          100: '#ccfffc',
          200: '#99fff9',
          300: '#66fff6',
          400: '#39FFCC', // Neon Cyan - Success states
          500: '#00e6b8',
          600: '#00cc9f',
          700: '#00b386',
          800: '#00996d',
          900: '#008054',
        },
        accent: {
          50: '#f0fcff',
          100: '#ccf7ff',
          200: '#99efff',
          300: '#66e7ff',
          400: '#33dfff',
          500: '#00D9FF', // Electric Blue - CTAs and links
          600: '#00c2e6',
          700: '#00abcc',
          800: '#0094b3',
          900: '#007d99',
        },
        background: '#2D1B69', // Deep Purple - Primary background
        surface: '#1A0B3D', // Dark Violet - Header/footer backgrounds
        foreground: '#ffffff',
        border: '#475569',
        // Custom colors for specific use
        'electric-blue': '#00D9FF',
        'neon-cyan': '#39FFCC',
        'deep-purple': '#2D1B69',
        'dark-violet': '#1A0B3D',
        'bright-purple': '#8B5FBF',
      },
    },
  },
  plugins: [],
}
