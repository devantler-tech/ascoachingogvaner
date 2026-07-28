import { expect, test, type APIRequestContext } from '@playwright/test';
import { parse } from 'acorn';

/**
 * The site must still render on the terminal browser releases for macOS 10.13
 * High Sierra — Safari 13.1.2, Chrome 116, Firefox 115 ESR. Safari 13.1 is the
 * binding constraint, and the two ways it silently loses the whole page are:
 *
 *   CSS — `@layer` is Safari 15.4+, and an unknown at-rule is discarded
 *         together with its block. Tailwind v4 puts the tokens, preflight and
 *         every utility in layers, so an unflattened sheet renders as
 *         completely unstyled HTML.
 *   JS  — Svelte 5's client runtime uses private class fields (Safari 14.1+)
 *         and logical assignment (Safari 14+). Both are *parse* errors, so the
 *         hydration import rejects and no client-side behaviour runs.
 *
 * Neither failure produces a build error or a console warning on a modern
 * engine, so these assertions are the only thing standing between a dependency
 * bump and a silently unstyled site.
 */

async function fetchText(request: APIRequestContext, url: string) {
	const response = await request.get(url);
	expect(response.ok(), `${url} should be served`).toBe(true);
	return response.text();
}

test.describe('legacy browser compatibility', () => {
	test('the stylesheet ships no cascade layers', async ({ page, request }) => {
		await page.goto('/');
		const hrefs = await page
			.locator('link[rel="stylesheet"]')
			.evaluateAll((links) => links.map((l) => (l as HTMLLinkElement).href));
		expect(hrefs.length, 'the page should ship at least one stylesheet').toBeGreaterThan(0);

		for (const href of hrefs) {
			const css = await fetchText(request, href);
			// Both the block form and the bare ordering statement discard styles
			// on an engine without @layer support.
			expect(css, `${href} must not use @layer`).not.toMatch(/@layer[\s{;]/i);
		}
	});

	test('the stylesheet keeps its design tokens and utilities', async ({ page, request }) => {
		await page.goto('/');
		const href = await page
			.locator('link[rel="stylesheet"]')
			.first()
			.evaluate((l) => (l as HTMLLinkElement).href);
		const css = await fetchText(request, href);

		// Guards against a "fix" that removes @layer by dropping its contents:
		// these come from @layer theme, @layer base and @layer utilities.
		expect(css, 'design tokens from @layer theme must survive').toContain('--color-canvas');
		expect(css, 'preflight/base styles must survive').toContain('font-family');
		expect(css, 'utilities from @layer utilities must survive').toMatch(/\.flex\{|\.flex,/);
	});

	test('every client module parses as ES2020, which Safari 13.1 implements in full', async ({
		page,
		request
	}) => {
		await page.goto('/');
		const entries: string[] = await page.evaluate(
			() =>
				[...document.querySelectorAll('script')]
					.map((s) => s.textContent ?? '')
					.join('\n')
					.match(/import\("([^"]+)"\)/g)
					?.map((m) => m.slice(8, -2)) ?? []
		);
		expect(entries.length, 'the page should bootstrap at least one module').toBeGreaterThan(0);

		const seen = new Set<string>();
		const queue = entries.map((s) => new URL(s, page.url()).href);

		for (let url = queue.shift(); url !== undefined; url = queue.shift()) {
			if (seen.has(url)) continue;
			seen.add(url);

			const js = await fetchText(request, url);

			// A real parse, not a pattern match: this rejects *any* post-ES2020
			// syntax a future dependency bump might introduce (logical
			// assignment, private class fields, class static blocks, top-level
			// await), and cannot be fooled by a hex colour in a string literal.
			// Syntax only — it says nothing about runtime APIs.
			expect(() => parse(js, { ecmaVersion: 2020, sourceType: 'module' }), url).not.toThrow();

			// Follow the static import graph so every reachable chunk is covered.
			for (const m of js.matchAll(/from\s*"([^"]+)"|import\s*\(\s*"([^"]+)"\s*\)/g)) {
				const spec = m[1] ?? m[2];
				if (spec?.startsWith('.')) queue.push(new URL(spec, url).href);
			}
		}

		// Strictly more than the entry modules: the entries import shared chunks,
		// so an equal count means the import-following regex stopped matching and
		// the walk silently shrank to the two entry points.
		expect(seen.size, 'should have followed imports beyond the entry modules').toBeGreaterThan(
			entries.length
		);
	});
});
