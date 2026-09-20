const nextConfig = require('eslint-config-next');
const tseslint = require('@typescript-eslint/eslint-plugin');
/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...Array.isArray(nextConfig) ? nextConfig : [nextConfig],
  {
    plugins: {
      '@typescript-eslint': tseslint,
    },
    ignores: [
      '.next/',
      'node_modules/',
    ],
    rules: {
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
module.exports = config;