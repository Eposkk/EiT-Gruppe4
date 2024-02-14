/** @type {import("eslint").Linter.Config} */
module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json',
	},
	plugins: ['@typescript-eslint', 'no-relative-import-paths'],
	extends: [
		'next/core-web-vitals',
		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		'@typescript-eslint/consistent-type-imports': [
			'warn',
			{
				prefer: 'type-imports',
				fixStyle: 'inline-type-imports',
			},
		],
		'@next/next/no-img-element': 'off',
		'no-relative-import-paths/no-relative-import-paths': [
			'warn',
			{
				prefix: '~',
				rootDir: 'src',
			},
		],
		'@typescript-eslint/no-misused-promises': [
			'error',
			{
				checksVoidReturn: false,
			},
		],
		'@typescript-eslint/no-empty-interface': 'off',
		'@typescript-eslint/no-unused-vars': 'warn',
		'@typescript-eslint/no-floating-promises': 'warn',
		'@typescript-eslint/no-explicit-any': 'off',
	},
}
