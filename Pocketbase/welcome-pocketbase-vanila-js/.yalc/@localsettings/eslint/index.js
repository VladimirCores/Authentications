
module.exports = {

  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:import/recommended"
  ],
  rules: {},
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module"
  }
};