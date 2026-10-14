const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const { defineConfig } = require('eslint/config');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
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
