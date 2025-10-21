# @aivo/tailwind-config

Shared Tailwind CSS preset for all Aivo Learning applications.

## Purpose

This package provides a centralized Tailwind CSS configuration that includes:
- Custom color palette (primary blues, accent purples)
- Custom typography (Inter, Poppins)
- Shared theme extensions
- Plugin configurations

## Why CommonJS?

This package uses **CommonJS (`.cjs`)** instead of ESM for a critical reason:

**VS Code Tailwind CSS IntelliSense** requires the config file to be loadable synchronously without a build step. ESM modules with TypeScript require compilation, but IntelliSense needs to resolve the config immediately. CommonJS allows the extension to `require()` the preset directly from `node_modules`.

## Usage

In your app's `tailwind.config.cjs`:

\`\`\`js
const preset = require('@aivo/tailwind-config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    // Add your content paths
  ],
};
\`\`\`

## Available Theme Extensions

### Colors

- **Primary Colors** (Blues): `primary-50` through `primary-950`
- **Accent Colors** (Purples): `accent-50` through `accent-950`

### Fonts

- **Sans**: `font-sans` → Inter, system-ui, sans-serif
- **Display**: `font-display` → Poppins, system-ui, sans-serif

## IntelliSense Setup

If IntelliSense doesn't work immediately:

1. Restart VS Code Extension Host: `Ctrl+Shift+P` → "Developer: Reload Window"
2. Ensure your app's config is named `tailwind.config.cjs` (CommonJS)
3. Check that `@aivo/tailwind-config` is installed in your workspace

## Compatibility

- ✅ Tailwind CSS v4+
- ✅ VS Code Tailwind CSS IntelliSense
- ✅ pnpm workspaces
- ✅ TypeScript type definitions included
