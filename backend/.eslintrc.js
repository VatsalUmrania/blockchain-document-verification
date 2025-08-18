// .eslintrc.js
module.exports = {
    env: {
      node: true,
      es2021: true,
      commonjs: true
    },
    extends: [
      'eslint:recommended'
    ],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'warn'
    },
    globals: {
      process: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly'
    }
  };
  