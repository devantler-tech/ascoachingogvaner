import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';

export default tseslint.config(
	...tseslint.configs.strict,
	...svelte.configs.recommended,
	{
		ignores: ['build/', '.svelte-kit/', 'node_modules/', 'dist/']
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser
			}
		}
	},
	{
		// The site is served at the domain root (no base path), so plain
		// literal hrefs are correct and need no resolve() wrapper.
		rules: {
			'svelte/no-navigation-without-resolve': 'off'
		}
	}
);
