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
    rules: {
      // These two are React Compiler-readiness rules, not general correctness checks — they
      // flag patterns this codebase uses deliberately: a ref mirroring the latest render's
      // state for stable callbacks outside React (AppContext's stateRef), and effects that
      // intentionally set local state to stay in sync with an external value (a countdown
      // timer, a field synced to an async hydration result). Downgraded to warnings rather
      // than left as hard errors that would push toward rewriting working code.
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      // Flags useRef(Date.now()) (capturing a mount timestamp) as an "impure" render call —
      // true under React Compiler's strict rules, harmless here since only the first render's
      // value is ever kept.
      'react-hooks/purity': 'warn',
    },
  },
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
