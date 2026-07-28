import { describe, expect, it } from 'vitest';
import { addLegacyWhereFallbacks, flattenCascadeLayers } from './flatten-cascade-layers';

describe('flattenCascadeLayers', () => {
	it('unwraps a layer block, keeping its rules', () => {
		expect(flattenCascadeLayers('@layer base{body{color:red}}')).toBe('body{color:red}');
	});

	it('drops layer-ordering statements, which carry no rules', () => {
		expect(flattenCascadeLayers('@layer theme,base,utilities;a{color:red}')).toBe('a{color:red}');
	});

	it('drops an empty layer declaration between rules', () => {
		expect(flattenCascadeLayers('a{color:red}@layer components;b{color:blue}')).toBe(
			'a{color:red}b{color:blue}'
		);
	});

	it('preserves the source order of layers, which is what encodes precedence', () => {
		const css = '@layer theme{:root{--c:red}}@layer base{body{color:var(--c)}}@layer utilities{.t{color:blue}}';
		expect(flattenCascadeLayers(css)).toBe(':root{--c:red}body{color:var(--c)}.t{color:blue}');
	});

	it('unwraps nested layers', () => {
		expect(flattenCascadeLayers('@layer a{@layer b{p{color:red}}}')).toBe('p{color:red}');
	});

	it('unwraps an anonymous layer', () => {
		expect(flattenCascadeLayers('@layer{p{color:red}}')).toBe('p{color:red}');
	});

	it('keeps a layer nested inside @media, unwrapping only the layer', () => {
		expect(flattenCascadeLayers('@media (min-width:40rem){@layer base{p{color:red}}}')).toBe(
			'@media (min-width:40rem){p{color:red}}'
		);
	});

	it('keeps the @supports fallback Tailwind emits for browsers without @property', () => {
		const css = '@layer properties{@supports (-webkit-hyphens:none){*{--tw-blur:initial}}}';
		expect(flattenCascadeLayers(css)).toBe('@supports (-webkit-hyphens:none){*{--tw-blur:initial}}');
	});

	it('leaves css without layers byte-for-byte identical', () => {
		const css = '/*! banner */@font-face{font-family:"X";src:url(/a.woff2)}.a{color:red}';
		expect(flattenCascadeLayers(css)).toBe(css);
	});

	it('does not treat a brace inside a string as block structure', () => {
		const css = '@layer base{a:after{content:"}"}}.b{color:red}';
		expect(flattenCascadeLayers(css)).toBe('a:after{content:"}"}.b{color:red}');
	});

	it('does not treat a brace inside a comment as block structure', () => {
		const css = '@layer base{/* } */p{color:red}}.b{color:blue}';
		expect(flattenCascadeLayers(css)).toBe('/* } */p{color:red}.b{color:blue}');
	});

	it('does not treat a brace inside an unquoted url() as block structure', () => {
		const css = '@layer base{p{background:url(/a}b.png)}}.b{color:red}';
		expect(flattenCascadeLayers(css)).toBe('p{background:url(/a}b.png)}.b{color:red}');
	});

	it('leaves at-rules whose name merely starts with "layer" alone', () => {
		expect(flattenCascadeLayers('@layers base{p{color:red}}')).toBe('@layers base{p{color:red}}');
	});

	it('matches @LAYER case-insensitively, as CSS at-rule names are', () => {
		expect(flattenCascadeLayers('@LAYER base{p{color:red}}')).toBe('p{color:red}');
	});

	it('keeps the contents of an unterminated layer block rather than dropping them', () => {
		expect(flattenCascadeLayers('@layer base{p{color:red}')).toBe('p{color:red}');
	});
});

describe('addLegacyWhereFallbacks', () => {
	const GUARD = '@supports not (inset:0)';

	it('duplicates a :where()-only rule behind the legacy feature query', () => {
		const css = ':where(.space-y-2>:not(:last-child)){margin-block-end:.5rem}';
		expect(addLegacyWhereFallbacks(css)).toBe(
			`${css}${GUARD}{.space-y-2>:not(:last-child){margin-block-end:.5rem}}`
		);
	});

	it('keeps the original rule, so modern engines are unaffected', () => {
		const css = ':where(.a){color:red}';
		expect(addLegacyWhereFallbacks(css).startsWith(css)).toBe(true);
	});

	it('leaves rules without :where() untouched', () => {
		const css = '.a{color:red}#b{color:blue}';
		expect(addLegacyWhereFallbacks(css)).toBe(css);
	});

	it('ignores a compound selector, keeping the transform to the one shape it can reason about', () => {
		// Unwrapping `abbr:where([title])` would mean splicing the inner
		// selector into its compound rather than replacing it, which changes
		// meaning in ways this pass deliberately does not attempt.
		const css = 'abbr:where([title]){color:red}';
		expect(addLegacyWhereFallbacks(css)).toBe(css);
	});

	it('ignores a descendant selector whose first part is :where()', () => {
		const css = ':where(select) optgroup{font-weight:bolder}';
		expect(addLegacyWhereFallbacks(css)).toBe(css);
	});

	it('ignores a :where() rule that still contains :is(), which old engines reject too', () => {
		const css = ':where(select:is([multiple],[size])){color:red}';
		expect(addLegacyWhereFallbacks(css)).toBe(css);
	});

	it('keeps a duplicate inside its enclosing @media context', () => {
		const css = '@media (min-width:40rem){:where(.a){color:red}}';
		expect(addLegacyWhereFallbacks(css)).toBe(
			`@media (min-width:40rem){:where(.a){color:red}${GUARD}{.a{color:red}}}`
		);
	});

	it('handles several rules, duplicating only the qualifying ones', () => {
		const css = '.x{color:red}:where(.a){color:blue}.y{color:green}';
		expect(addLegacyWhereFallbacks(css)).toBe(
			`.x{color:red}:where(.a){color:blue}${GUARD}{.a{color:blue}}.y{color:green}`
		);
	});

	it('is not confused by a brace inside a string', () => {
		const css = '.x:after{content:"{"}:where(.a){color:red}';
		expect(addLegacyWhereFallbacks(css)).toBe(
			`.x:after{content:"{"}:where(.a){color:red}${GUARD}{.a{color:red}}`
		);
	});

	it('leaves css it cannot parse (unterminated block) untouched', () => {
		const css = ':where(.a){color:red';
		expect(addLegacyWhereFallbacks(css)).toBe(css);
	});

	it('composes with flattening: a layered :where() rule gets its fallback', () => {
		const css = '@layer utilities{:where(.a){color:red}}';
		expect(addLegacyWhereFallbacks(flattenCascadeLayers(css))).toBe(
			`:where(.a){color:red}${GUARD}{.a{color:red}}`
		);
	});
});
