/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Material Design 3 Color Tokens
      colors: {
        primary: {
          DEFAULT: '#6750A4',
          container: '#EADDFF',
          'on-primary': '#FFFFFF',
          'on-container': '#21005D',
        },
        secondary: {
          DEFAULT: '#625B71',
          container: '#E8DEF8',
          'on-secondary': '#FFFFFF',
          'on-container': '#1D192B',
        },
        tertiary: {
          DEFAULT: '#7D5260',
          container: '#FFD8E4',
          'on-tertiary': '#FFFFFF',
          'on-container': '#31111D',
        },
        error: {
          DEFAULT: '#B3261E',
          container: '#F9DEDC',
          'on-error': '#FFFFFF',
          'on-container': '#410E0B',
        },
        surface: {
          DEFAULT: '#FEF7FF',
          variant: '#E7E0EC',
          'on-surface': '#1C1B1F',
          'on-variant': '#49454F',
        },
        outline: {
          DEFAULT: '#79747E',
          variant: '#CAC4D0',
        },
        background: '#FEF7FF',
        'on-background': '#1C1B1F',
      },
      // Typography Scale (Material Design 3)
      fontSize: {
        'display-lg': ['57px', { lineHeight: '64px', fontWeight: '400' }],
        'display-md': ['45px', { lineHeight: '52px', fontWeight: '400' }],
        'display-sm': ['36px', { lineHeight: '44px', fontWeight: '400' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '400' }],
        'headline-md': ['28px', { lineHeight: '36px', fontWeight: '400' }],
        'headline-sm': ['24px', { lineHeight: '32px', fontWeight: '400' }],
        'title-lg': ['22px', { lineHeight: '28px', fontWeight: '400' }],
        'title-md': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'title-sm': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'label-md': ['12px', { lineHeight: '16px', fontWeight: '600' }],
        'label-sm': ['11px', { lineHeight: '16px', fontWeight: '600' }],
      },
      // Spacing scale (4pt grid)
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
      },
      // Border radius (Material Design 3)
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        'full': '9999px',
      },
      // Box shadow (elevation)
      boxShadow: {
        'elevation-1': '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'elevation-2': '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
        'elevation-3': '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3)',
        'elevation-4': '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px rgba(0, 0, 0, 0.3)',
        'elevation-5': '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)',
      },
      // Animation durations
      transitionDuration: {
        'fast': '120ms',
        'normal': '200ms',
        'slow': '300ms',
      },
      // Font family
      fontFamily: {
        sans: ['Roboto Flex', 'Inter', 'system-ui', 'sans-serif'],
      },
      // Existing animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
