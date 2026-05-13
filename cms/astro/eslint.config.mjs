import pluginJs from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import pluginPromise from 'eslint-plugin-promise';
import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tailwind from 'eslint-plugin-tailwindcss';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'dist/**',
      '.astro/**',
      '.vercel/**',
      'node_modules/**',
      'src/types/directus-schema.ts',
      'pnpm-lock.yaml',
    ],
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  // JS/TS/TSX first — Astro configs must come last so `.astro` keeps astro-eslint-parser
  ...tseslint.config(
    {
      files: ['**/*.{js,mjs,cjs,ts,tsx,jsx}'],
      languageOptions: {
        ecmaVersion: 'latest',
        globals: { ...globals.browser, ...globals.node },
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    pluginJs.configs.recommended,
    importPlugin.flatConfigs.recommended,
    ...tseslint.configs.recommended,
    pluginPromise.configs['flat/recommended'],
    pluginReact.configs.flat.recommended,
    pluginReact.configs.flat['jsx-runtime'],
    reactHooks.configs.flat['recommended-latest'],
    eslintConfigPrettier,
    ...tailwind.configs['flat/recommended'],
    {
      rules: {
        'no-unused-vars': 'off',
        'react/react-in-jsx-scope': 'off',
        'react-hooks/exhaustive-deps': 'off',
        // React Compiler rules (react-hooks v7) — experimental, disable until compiler is configured
        'react-hooks/static-components': 'off',
        'react-hooks/use-memo': 'off',
        'react-hooks/void-use-memo': 'off',
        'react-hooks/component-hook-factories': 'off',
        'react-hooks/preserve-manual-memoization': 'off',
        'react-hooks/incompatible-library': 'off',
        'react-hooks/immutability': 'off',
        'react-hooks/globals': 'off',
        'react-hooks/refs': 'off',
        'react-hooks/set-state-in-effect': 'off',
        'react-hooks/error-boundaries': 'off',
        'react-hooks/purity': 'off',
        'react-hooks/set-state-in-render': 'off',
        'react-hooks/unsupported-syntax': 'off',
        'react-hooks/config': 'off',
        'react-hooks/gating': 'off',
        'react/display-name': 'off',
        'react/prop-types': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
        'tailwindcss/no-custom-classname': 'off',
        'tailwindcss/migration-from-tailwind-2': 'off',
        'import/no-unresolved': 'off',
        'import/no-named-as-default': 'off',
        // ! TO COMPILE SHADCN EXAMPLES, PLEASE REMOVE AS NEEDED
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        'react/no-unescaped-entities': 'off',
        'react/no-unknown-property': 'off',
        'tailwindcss/no-unnecessary-arbitrary-value': 'off',
        'tailwindcss/classnames-order': 'off',
        'import/named': 'off',
        'import/no-named-as-default-member': 'off',
        'tailwindcss/enforces-shorthand': 'off',
        'import/no-duplicates': 'off',
        'newline-before-return': 'error',
      },
    },
  ),
  {
    files: ['src/lib/directus/**/*.ts'],
    rules: {
      // Directus client uses a `useDirectus()` helper — not React hooks
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  ...eslintPluginAstro.configs['flat/recommended'],
];
