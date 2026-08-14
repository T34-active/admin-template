import js from '@eslint/js'
import globals from 'globals'
import tseslint, { configs as tsConfigs, parser as tsParser } from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import pluginPromise from 'eslint-plugin-promise'
import { importX } from 'eslint-plugin-import-x'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'
import autoImport from './.eslintrc-auto-import.json' with { type: 'json' }

const autoImportGlobals = Object.fromEntries(
  Object.keys(autoImport.globals || {}).map((key) => [key, 'readonly']),
)

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/public/**', '**/src/assets/**', 'build/*.js', '**/node_modules/**'],
  },
  js.configs.recommended,
  ...tsConfigs.recommended,
  ...pluginVue.configs['flat/essential'],
  pluginPromise.configs['flat/recommended'],
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...autoImportGlobals,
      },
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    settings: {
      'import-x/resolver': {
        typescript: true,
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'import-x/no-unresolved': 'off',
      'import-x/extensions': 'off',
      'import-x/prefer-default-export': 'off',
      'no-console': 'off',
      'no-plusplus': 'off',
      'no-shadow': 'off',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-underscore-dangle': 'off',
      'no-use-before-define': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-param-reassign': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'error',
      camelcase: 'off',
    },
  },
  eslintConfigPrettier,
  eslintPluginPrettier,
)
