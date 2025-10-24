const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

// Get the project root
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/**
 * Metro configuration for React Native in a monorepo
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  // Watch folders for changes (include monorepo packages)
  watchFolders: [
    projectRoot,
    path.resolve(workspaceRoot, 'packages/types'),
    path.resolve(workspaceRoot, 'packages/utils'),
  ],

  resolver: {
    // Include monorepo packages
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],

    // Resolve extra node modules from workspace root
    extraNodeModules: {
      '@aivo/types': path.resolve(workspaceRoot, 'packages/types/src'),
      '@aivo/utils': path.resolve(workspaceRoot, 'packages/utils/src'),
    },

    // Support for platform-specific extensions
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
  },

  transformer: {
    // Enable Hermes bytecode compilation
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),

    // Production minification config
    minifierConfig: {
      keep_classnames: false, // Remove class names in production
      keep_fnames: false, // Remove function names in production
      mangle: {
        toplevel: true, // Mangle top-level names
      },
      compress: {
        drop_console: process.env.NODE_ENV === 'production', // Remove console.logs in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: [
          'console.info',
          'console.debug',
          'console.warn',
          'console.trace',
        ], // Remove specific console methods
        passes: 3, // Multiple compression passes
      },
      output: {
        comments: false, // Remove all comments
        ascii_only: true, // ASCII-only output for better compatibility
      },
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
