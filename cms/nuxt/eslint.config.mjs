import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import vueParser from 'vue-eslint-parser';
import vuePlugin from 'eslint-plugin-vue';
import globals from 'globals';

export default [
	{
		ignores: ['**/node_modules/**', '**/dist/**', '**/.nuxt/**', '**/.output/**', '.eslintrc.js'],
	},
	prettierConfig,
	{
		files: ['**/*.{js,jsx,ts,tsx,vue,mjs}'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tsParser,
				sourceType: 'module',
				ecmaVersion: 2022,
				extraFileExtensions: ['.vue'],
			},
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2021,
			},
		},
		plugins: {
			'@typescript-eslint': typescriptEslint,
			vue: vuePlugin,
			prettier: prettier,
		},
		rules: {
			'prettier/prettier': 'error',

			// TypeScript
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],

			// Vue
			'vue/multi-word-component-names': 'off',
			'vue/require-default-prop': 'off',
			'vue/no-v-html': 'off',

			// General
			'no-console': 'error',
			'no-debugger': 'error',

			'padding-line-between-statements': [
				'error',
				{ blankLine: 'always', prev: ['block', 'block-like', 'cjs-export', 'class', 'export', 'import'], next: '*' },
				{
					blankLine: 'always',
					prev: ['const', 'let'],
					next: ['block', 'block-like', 'cjs-export', 'class', 'export', 'import'],
				},
				{ blankLine: 'any', prev: ['export', 'import'], next: ['export', 'import'] },
			],
		},
	},
	{
		files: ['**/*.vue'],
		rules: {
			...vuePlugin.configs['vue3-recommended'].rules,
		},
	},
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json',
			},
		},
		rules: {
			...typescriptEslint.configs['recommended'].rules,
		},
	},
];
