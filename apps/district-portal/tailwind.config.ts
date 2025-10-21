import type { Config } from 'tailwindcss';
import sharedConfig from '@aivo/tailwind-config';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  presets: [sharedConfig],
};

export default config;
