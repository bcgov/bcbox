/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true
  },
  extends: [
    '@vue/eslint-config-typescript',
    'eslint:recommended',
    'plugin:vitest-globals/recommended',
    'plugin:vue/vue3-recommended'
  ],
  overrides: [
    {
      files: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,vue}'],
      env: {
        'vitest-globals/env': true
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 11,
  },
  plugins: [],
  rules: {
    'eol-last': ['error', 'always'],
    indent: ['error', 2, {
      'SwitchCase': 1
    }],
    'linebreak-style': ['error', 'unix'],
    'max-len': ['warn', { 'code': 120, 'comments': 120, 'ignoreUrls': true }],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'vue/component-tags-order': [
      'error',
      {
        order: ['script', 'template', 'style'],
      },
    ],
    'vue/html-self-closing': [
      'error',
      {
        'html': {
          'void': 'any'
        }
      }
    ],
    'vue/multi-word-component-names': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
};
