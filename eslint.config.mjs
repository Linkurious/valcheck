// @ts-check
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['lib/', 'test-build/', 'coverage/', '.nyc_output/', 'reports/', 'jsdoc/']),
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended
    ],
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      // allow assignments in conditions
      'no-cond-assign': 'off',

      // allow empty interfaces
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'always' }],

      // allow `import x = require('x')` and `require()` calls
      '@typescript-eslint/no-require-imports': 'off',

      // allow `@ts-ignore` comments as long as they are explained
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],

      // disallow usage of any as a type declaration
      '@typescript-eslint/no-explicit-any': 'error',

      // require return types on functions (non-arrow function expressions excluded)
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],

      // require === and !== in place of == and !=
      'eqeqeq': ['error', 'always'],

      // any shorthand object literal syntax will cause a failure
      'object-shorthand': ['error', 'never'],

      // require curly braces for all control statements
      'curly': 'error',

      // require single quotes for string literals
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: 'always' }],

      // always disallow trailing commas
      '@stylistic/comma-dangle': ['error', 'never'],

      // require semicolons
      '@stylistic/semi': ['error', 'always'],

      // arrow function parameters must always be wrapped in parentheses
      '@stylistic/arrow-parens': ['error', 'always'],

      // lines must be maximum 120 characters (except block comments)
      '@stylistic/max-len': ['error', { code: 120, ignorePattern: '^\\s*\\*' }]
    }
  }
);


