import baseConfig from '@aivo/tailwind-config';

/** @type {import('tailwindcss').Config} */
export default {
  ...baseConfig,
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...(baseConfig.theme?.extend || {}),
      fontFamily: {
        opendyslexic: ['OpenDyslexic', 'sans-serif'],
        comic: ['Comic Neue', 'Comic Sans MS', 'cursive'],
      },
      transitionDuration: {
        '4000': '4000ms',
      },
      scale: {
        '102': '1.02',
      }
    },
  },
};
