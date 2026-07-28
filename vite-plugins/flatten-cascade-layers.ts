import type { Plugin } from 'vite';

/**
 * Tailwind v4 emits its design tokens, preflight and every utility inside CSS
 * cascade layers (`@layer theme/base/utilities`). `@layer` landed in Safari
 * 15.4, and a browser that does not know an at-rule discards the at-rule
 * *together with its block* — so on older engines the entire design system is
 * dropped and the page renders as unstyled HTML. That is every Safari shipped
 * for macOS 10.13 High Sierra (13.1.2) and 10.14 Mojave (14.1.2).
 *
 * Flattening the layers back into plain rules is what Tailwind v3 did for
 * years: the layers are emitted in precedence order (theme, base, utilities),
 * and Tailwind's own utilities are single-class selectors while preflight and
 * our `@layer base` overrides are element selectors — so ordinary specificity
 * already reproduces the layer precedence, and the flattened sheet behaves
 * identically on modern engines.
 */

/** Index just past the comment opening at `i`. */
function endOfComment(css: string, i: number): number {
	const end = css.indexOf('*/', i + 2);
	return end === -1 ? css.length : end + 2;
}

/** Index just past the quoted string opening at `i`. */
function endOfString(css: string, i: number): number {
	const quote = css[i];
	let j = i + 1;
	while (j < css.length) {
		const c = css[j];
		if (c === '\\') j += 2;
		else if (c === quote) return j + 1;
		else if (c === '\n') return j; // an unterminated string ends at the newline
		else j++;
	}
	return css.length;
}

/**
 * Index just past an unquoted `url(...)` token starting at `i`. Unquoted URLs
 * are the one place a raw brace can legally appear outside a string, so they
 * are skipped whole rather than scanned for braces.
 */
function endOfUnquotedUrl(css: string, i: number): number {
	const close = css.indexOf(')', i);
	return close === -1 ? css.length : close + 1;
}

/** True when an unquoted `url(` token starts at `i`. */
function isUnquotedUrl(css: string, i: number): boolean {
	if (!/^url\(/i.test(css.slice(i, i + 4))) return false;
	const next = css.slice(i + 4).match(/^\s*/)?.[0].length ?? 0;
	const first = css[i + 4 + next];
	return first !== '"' && first !== "'";
}

/** Index of the `{` or `;` that terminates an at-rule prelude starting at `i`. */
function endOfPrelude(css: string, i: number): number {
	let j = i;
	while (j < css.length) {
		const c = css[j];
		if (c === '/' && css[j + 1] === '*') j = endOfComment(css, j);
		else if (c === '"' || c === "'") j = endOfString(css, j);
		else if (c === '{' || c === ';') return j;
		else j++;
	}
	return css.length;
}

/** Index just past the `}` matching the `{` at `open`, or -1 when unterminated. */
function endOfBlock(css: string, open: number): number {
	let depth = 0;
	let j = open;
	while (j < css.length) {
		const c = css[j];
		if (c === '/' && css[j + 1] === '*') j = endOfComment(css, j);
		else if (c === '"' || c === "'") j = endOfString(css, j);
		else if ((c === 'u' || c === 'U') && isUnquotedUrl(css, j)) j = endOfUnquotedUrl(css, j);
		else if (c === '{') {
			depth++;
			j++;
		} else if (c === '}') {
			depth--;
			j++;
			if (depth === 0) return j;
		} else j++;
	}
	return -1;
}

/**
 * Rewrites `css` so no `@layer` remains, preserving the order and content of
 * every rule. Layer blocks are replaced by their contents (recursively, so
 * nested layers unwrap too) and bare `@layer a, b;` ordering statements are
 * removed.
 */
export function flattenCascadeLayers(css: string): string {
	let out = '';
	let i = 0;

	while (i < css.length) {
		const c = css[i];

		if (c === '/' && css[i + 1] === '*') {
			const end = endOfComment(css, i);
			out += css.slice(i, end);
			i = end;
			continue;
		}

		if (c === '"' || c === "'") {
			const end = endOfString(css, i);
			out += css.slice(i, end);
			i = end;
			continue;
		}

		// `@layer` must be followed by a non-identifier char so `@layers` and
		// any future `@layer`-prefixed at-rule are left alone.
		if (c === '@' && /^@layer(?![\w-])/i.test(css.slice(i, i + 7))) {
			const terminator = endOfPrelude(css, i);

			if (css[terminator] === ';') {
				i = terminator + 1; // layer-ordering statement: carries no rules
				continue;
			}
			if (css[terminator] !== '{') {
				i = css.length; // truncated prelude: nothing left worth keeping
				continue;
			}

			const end = endOfBlock(css, terminator);
			const inner =
				end === -1 ? css.slice(terminator + 1) : css.slice(terminator + 1, end - 1);
			out += flattenCascadeLayers(inner);
			i = end === -1 ? css.length : end;
			continue;
		}

		out += c;
		i++;
	}

	return out;
}

/**
 * `:where()` arrived in Safari 14, and an unknown pseudo-class invalidates the
 * whole selector — so Safari 13.1 also drops Tailwind's `space-y-*` rules,
 * which it wraps in `:where()` purely to give them zero specificity.
 *
 * Feature query, not a rewrite: `inset` shipped in Safari 14.1, so this block
 * is dead on every engine that already understands `:where()` and the modern
 * cascade is untouched. Only a selector that is *entirely* one `:where()`
 * wrapper is duplicated, and only when unwrapping actually yields something an
 * old engine can parse — a nested `:is()` would still be invalid there, so
 * those rules are left alone rather than duplicated uselessly.
 */
const LEGACY_SUPPORTS = '@supports not (inset:0)';

/** The inner selector when `selector` is exactly one `:where(...)` wrapper. */
function unwrapWhereSelector(selector: string): string | null {
	const trimmed = selector.trim();
	if (!/^:where\(/i.test(trimmed)) return null;

	let depth = 0;
	for (let i = 6; i < trimmed.length; i++) {
		const c = trimmed[i];
		if (c === '"' || c === "'") i = endOfString(trimmed, i) - 1;
		else if (c === '(') depth++;
		else if (c === ')') {
			depth--;
			// The wrapper must close at the very end, or this is a compound
			// selector such as `:where(a) b` that unwrapping would not rescue.
			if (depth === 0) {
				if (i !== trimmed.length - 1) return null;
				const inner = trimmed.slice(7, i);
				return /:is\(|:where\(/i.test(inner) ? null : inner;
			}
		}
	}
	return null;
}

/**
 * Emits a legacy duplicate of every `:where()`-only rule, guarded by a feature
 * query no engine with `:where()` support satisfies. Recurses into conditional
 * at-rules so a duplicate keeps its enclosing `@media` context.
 */
export function addLegacyWhereFallbacks(css: string): string {
	let out = '';
	let i = 0;
	let ruleStart = 0;

	while (i < css.length) {
		const c = css[i];

		if (c === '/' && css[i + 1] === '*') {
			i = endOfComment(css, i);
			continue;
		}
		if (c === '"' || c === "'") {
			i = endOfString(css, i);
			continue;
		}
		if ((c === 'u' || c === 'U') && isUnquotedUrl(css, i)) {
			i = endOfUnquotedUrl(css, i);
			continue;
		}
		if (c !== '{') {
			i++;
			continue;
		}

		const end = endOfBlock(css, i);
		if (end === -1) break; // unterminated: emit the remainder untouched below

		const prelude = css.slice(ruleStart, i);
		const body = css.slice(i + 1, end - 1);
		const selector = prelude.replace(/\/\*[\s\S]*?\*\//g, '').trim();

		if (/^@(media|supports|container|layer)\b/i.test(selector)) {
			out += `${prelude}{${addLegacyWhereFallbacks(body)}}`;
		} else {
			out += css.slice(ruleStart, end);
			const inner = unwrapWhereSelector(selector);
			if (inner !== null) out += `${LEGACY_SUPPORTS}{${inner}{${body}}}`;
		}

		i = end;
		ruleStart = end;
	}

	return out + css.slice(ruleStart);
}

/**
 * Vite plugin rewriting every emitted stylesheet for the browsers in
 * `environments.client.build.target`. Runs as a `post` plugin so it sees the
 * final, minified CSS that Tailwind and Vite have finished producing.
 */
export function flattenCascadeLayersPlugin(): Plugin {
	return {
		name: 'flatten-css-cascade-layers',
		enforce: 'post',
		apply: 'build',
		generateBundle(_options, bundle) {
			for (const file of Object.values(bundle)) {
				if (file.type !== 'asset' || !file.fileName.endsWith('.css')) continue;
				const source =
					typeof file.source === 'string' ? file.source : new TextDecoder().decode(file.source);
				file.source = addLegacyWhereFallbacks(flattenCascadeLayers(source));
			}
		}
	};
}
