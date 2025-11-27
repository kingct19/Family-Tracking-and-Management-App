/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '360px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      // HaloHub Experience Color Palette
      colors: {
        primary: {
          DEFAULT: '#7A3BFF',
          light: '#944BFF',
          container: '#F2EFFE',
          'on-primary': '#FFFFFF',
          'on-container': '#1E1A2B',
        },
        secondary: {
          DEFAULT: '#FFC857',
          light: '#FF8C94',
          container: '#FFF4E6',
          'on-secondary': '#1E1A2B',
          'on-container': '#1E1A2B',
        },
        neutral: {
          white: '#FFFFFF',
          'gray-50': '#F7F7FA',
          'gray-300': '#C9C5D5',
          'gray-900': '#1E1A2B',
        },
        error: {
          DEFAULT: '#B3261E',
          container: '#F9DEDC',
          'on-error': '#FFFFFF',
          'on-container': '#410E0B',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          variant: '#F7F7FA',
          'on-surface': '#1E1A2B',
          'on-variant': '#49454F',
        },
        outline: {
          DEFAULT: '#C9C5D5',
          variant: '#E7E0FF',
        },
        background: {
          DEFAULT: '#F2EFFE',
          light: '#E7E0FF',
        },
        'on-background': '#1E1A2B',
      },
      // Typography Scale (HaloHub Experience)
      fontSize: {
        'display': ['48px', { lineHeight: '56px', fontWeight: '600' }],
        'headline': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'title': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'caption': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        // Legacy MD3 support
        'display-lg': ['48px', { lineHeight: '56px', fontWeight: '600' }],
        'display-md': ['48px', { lineHeight: '56px', fontWeight: '600' }],
        'display-sm': ['48px', { lineHeight: '56px', fontWeight: '600' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'headline-md': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'headline-sm': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'title-lg': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'title-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'title-sm': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'label-md': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '600' }],
      },
      // Spacing scale (HaloHub - 4pt grid)
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      // Border radius (HaloHub Experience)
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        'card': '24px',
        'button': '9999px',
        'input': '12px',
        'full': '9999px',
      },
      // Box shadow (HaloHub Experience)
      boxShadow: {
        'elevation-1': '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'elevation-2': '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
        'elevation-3': '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3)',
        'elevation-4': '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px rgba(0, 0, 0, 0.3)',
        'elevation-5': '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)',
        'cta': '0 8px 20px rgba(122, 59, 255, 0.35)',
        'map-lg': '0 0 30px -4px rgba(0, 0, 0, 0.15)',
      },
      // Animation durations (HaloHub Experience)
      transitionDuration: {
        'enter': '200ms',
        'exit': '160ms',
        'emphasis': '280ms',
        'fast': '160ms',
        'normal': '200ms',
        'slow': '280ms',
      },
      // Font family (HaloHub Experience - Inter primary, Roboto Flex secondary)
      fontFamily: {
        sans: ['Inter', 'Roboto Flex', 'system-ui', 'sans-serif'],
        display: ['Inter', 'Roboto Flex', 'system-ui', 'sans-serif'],
      },
      // Animations (HaloHub Experience)
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0.2, 0, 0, 1)',
        'slide-in': 'slideIn 200ms cubic-bezier(0.2, 0, 0, 1)',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.3, 0, 0, 1)',
        'fade-slide': 'fadeSlide 200ms cubic-bezier(0.2, 0, 0, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeSlide: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      // Easing functions
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.2, 0, 0, 1)',
        'emphasized': 'cubic-bezier(0.3, 0, 0, 1)',
      },
    },
  },
  plugins: [],
}
