module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // NativeWind (Tailwind CSS for React Native)
    'nativewind/babel',
    
    // React Native Reanimated (must be listed last)
    'react-native-reanimated/plugin',
    
    // Module resolver for path aliases
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
        alias: {
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@services': './src/services',
          '@stores': './src/stores',
          '@hooks': './src/hooks',
          '@utils': './src/utils',
          '@types': './src/types',
          '@assets': './src/assets',
          '@theme': './src/theme',
          '@config': './src/config',
        },
      },
    ],
  ],
};
