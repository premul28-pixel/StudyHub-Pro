/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ios: {
          bg: '#F5F5F7',
          card: '#FFFFFF',
          blue: {
            DEFAULT: '#007AFF',
            hover: '#0062CC',
            light: '#EBF5FF',
            subtle: '#E5F1FF',
          },
          text: {
            DEFAULT: '#1C1C1E',
            secondary: '#8E8E93',
            tertiary: '#AEAEB2',
            quaternary: '#C7C7CC',
          },
          separator: '#E5E5EA',
          border: 'rgba(0, 0, 0, 0.08)',
          surface: '#F2F2F7',
          elevated: '#FFFFFF',
          green: '#34C759',
          red: '#FF3B30',
          orange: '#FF9500',
          purple: '#AF52DE',
          indigo: '#5856D6',
          teal: '#30B0C7',
          yellow: '#FFCC00',
        },
      },
      borderRadius: {
        'ios-sm': '10px',
        'ios': '14px',
        'ios-lg': '18px',
        'ios-xl': '22px',
        'ios-2xl': '28px',
      },
      boxShadow: {
        'ios-sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'ios': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'ios-card': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'ios-elevated': '0 10px 30px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'ios-float': '0 20px 40px -8px rgba(0, 0, 0, 0.12)',
        'ios-blue': '0 4px 14px 0 rgba(0, 122, 255, 0.35)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Inter"',
          'system-ui',
          'sans-serif',
        ],
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
}
