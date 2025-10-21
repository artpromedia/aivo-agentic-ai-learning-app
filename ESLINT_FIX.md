# ESLint Peer Dependency Fix

## Issue
After setting up the Turborepo monorepo with ESLint v9, we encountered peer dependency warnings:

```
WARN Issues with peer dependencies found
└─┬ @aivo/eslint-config
  ├── ✕ unmet peer eslint@^8.56.0 from @typescript-eslint/parser@7.18.0
  └── ✕ unmet peer eslint@^8.56.0 from @typescript-eslint/eslint-plugin@7.18.0
```

## Root Cause
The TypeScript ESLint v7 packages were incompatible with ESLint v9:
- `@typescript-eslint/parser@7.18.0` requires `eslint@^8.56.0`
- `@typescript-eslint/eslint-plugin@7.18.0` requires `eslint@^8.56.0`
- But we were using `eslint@9.38.0`

## Solution
Upgraded to ESLint v9 compatible packages in `packages/config/eslint/package.json`:

### Package Upgrades
```json
{
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^8.46.1",  // was ^7.18.0
    "@typescript-eslint/parser": "^8.46.1",         // was ^7.18.0
    "eslint": "^9.38.0",
    "eslint-plugin-react": "^7.35.0",
    "eslint-plugin-react-hooks": "^5.2.0",          // was ^4.6.2
    "globals": "^15.0.0"                            // newly added
  }
}
```

### Additional Fixes
1. **Added globals package** for environment definitions (browser, node, ES2021)
2. **Updated ESLint config** to use `languageOptions.globals` instead of deprecated `env`
3. **Added ESLint to individual packages** that were missing it:
   - `packages/ui`
   - `packages/utils`
   - `apps/api`
4. **Added Node.js globals** to `apps/api` eslint config for console, process, etc.

## Configuration Updates

### packages/config/eslint/index.js
```javascript
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
```

### apps/api/eslint.config.js
```javascript
import config from '@aivo/eslint-config';

export default [
  ...config,
  {
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
  },
];
```

## Verification
After the fixes, all packages lint successfully:

```bash
pnpm lint
# ✓ @aivo/api#lint (3 packages)
# ✓ @aivo/web#lint (7 packages total)
# Tasks: 7 successful, 7 total
# Time: 7.168s
```

No peer dependency warnings remain.

## Key Takeaways
1. **ESLint v9 requires TypeScript ESLint v8+** - The v7 packages are incompatible
2. **React Hooks plugin v5+** is required for ESLint v9 compatibility
3. **Use `languageOptions.globals`** instead of deprecated `env` configuration
4. **Each package needs ESLint** as a devDependency to run lint scripts locally
5. **Node.js globals must be explicitly defined** for Node.js-only packages

## Version Compatibility Matrix
| Package | Compatible Version | Notes |
|---------|-------------------|-------|
| eslint | v9.38.0+ | Core linter |
| @typescript-eslint/parser | v8.46.1+ | ESLint v9 compatible |
| @typescript-eslint/eslint-plugin | v8.46.1+ | ESLint v9 compatible |
| eslint-plugin-react-hooks | v5.2.0+ | ESLint v9 compatible |
| globals | v15.0.0+ | Environment globals |

## References
- [TypeScript ESLint v8 Migration Guide](https://typescript-eslint.io/blog/announcing-typescript-eslint-v8)
- [ESLint v9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- [eslint-plugin-react-hooks v5 Release](https://github.com/facebook/react/releases/tag/eslint-plugin-react-hooks%405.0.0)
