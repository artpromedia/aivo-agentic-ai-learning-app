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
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
