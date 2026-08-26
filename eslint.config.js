const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const { defineConfig } = require('eslint/config');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
  // Turns off every ESLint rule that would otherwise conflict with Prettier's own
  // formatting decisions — Prettier owns whitespace/quotes/wrapping, ESLint owns everything else.
  prettierConfig,
  {
    files: ['**/*.test.js', '**/*.test.jsx'],
    languageOptions: {
      globals: { ...globals.jest },
    },
  },
  {
    ignores: ['node_modules/*', '.expo/*', 'dist/*'],
  },
]);
