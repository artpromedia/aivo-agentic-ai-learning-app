import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    ...tseslint.configs.recommended,
  },
];
