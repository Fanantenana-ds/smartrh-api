const globals = require("globals");

module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "complexity": ["error", 10],
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];