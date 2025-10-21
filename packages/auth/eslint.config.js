import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/*.test.ts', '**/*.test.tsx', 'EXAMPLES.tsx', '**/__tests__/**'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  ...tseslint.configs.recommended,
);
