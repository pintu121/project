/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            'code::before': {
              content: '""'
            },
            'code::after': {
              content: '""'
            },
            code: {
              color: theme('colors.blue.600'),
              backgroundColor: theme('colors.blue.50'),
              borderRadius: theme('borderRadius.DEFAULT'),
              paddingLeft: theme('spacing.1.5'),
              paddingRight: theme('spacing.1.5'),
              paddingTop: theme('spacing.0.5'),
              paddingBottom: theme('spacing.0.5'),
              fontWeight: '400',
            },
            pre: {
              backgroundColor: theme('colors.gray.100'),
              color: theme('colors.gray.800'),
              borderRadius: theme('borderRadius.lg'),
              padding: theme('spacing.4'),
              marginTop: theme('spacing.4'),
              marginBottom: theme('spacing.4'),
              overflowX: 'auto',
            },
            'pre code': {
              backgroundColor: 'transparent',
              borderRadius: '0',
              padding: '0',
              color: 'inherit',
              fontSize: 'inherit',
              fontWeight: 'inherit',
              display: 'inline',
              lineHeight: 'inherit',
            },
            'h1, h2, h3, h4': {
              color: theme('colors.gray.900'),
            },
            'h1 a, h2 a, h3 a, h4 a': {
              color: 'inherit',
              textDecoration: 'none',
            },
            '.dark pre': {
              backgroundColor: theme('colors.gray.800'),
              color: theme('colors.gray.200'),
            },
            '.dark code': {
              color: theme('colors.blue.400'),
              backgroundColor: theme('colors.blue.900'),
              opacity: 0.3,
            },
            '.dark h1, .dark h2, .dark h3, .dark h4': {
              color: theme('colors.white'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};