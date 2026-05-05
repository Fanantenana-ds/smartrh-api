const globals = require('globals');

module.exports = [
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**', 'coverage/**', 'tests/**'],
    languageOptions: {
      sourceType: 'commonjs',
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'complexity': ['error', 5],
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
];