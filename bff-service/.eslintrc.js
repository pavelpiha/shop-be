module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  files: ['*.ts'],
  ignorePatterns: ['.eslintrc.js', './dist/**/*'],
  rules: {
    'prettier/prettier': ['warn'],
    'curly': 'error',
    'eol-last': 'error',
    'eqeqeq': ['error', 'smart'],
    'arrow-body-style': 'error',
    'no-var': 'error',
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/consistent-type-assertions': 'error',
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        'accessibility': 'no-public',
      },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-use-before-define': 'off', // note you must disable the base eslint rule as it can report incorrect errors
    '@typescript-eslint/no-use-before-define': 'error',
    '@typescript-eslint/type-annotation-spacing': 'error',
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
