import { test, expect } from '@playwright/test';

// The Content-Security-Policy is a tested invariant (#97): every prerendered
// page carries a CSP <meta> tag (svelte.config.js kit.csp) that must keep
// allowing exactly the site's one external origin (self-hosted Umami
// analytics — fonts are self-hosted build assets since #98) while hashing
// SvelteKit's inline hydration script. A directive typo would silently break
// analytics or hydration in production, so the page is exercised under the
// enforced policy here.

test('CSP meta tag allows exactly what the page needs, with zero violations', async ({ page }) => {
	const violations: string[] = [];
	page.on('console', (message) => {
		const text = message.text();
		if (text.includes('Content Security Policy') || text.includes('Refused to')) {
			violations.push(text);
		}
	});

	// Fonts are self-hosted (#98): a same-origin woff2 must load, and no
	// request of any kind may leave the origin for fonts.
	const fontRequests: string[] = [];
	page.on('request', (request) => {
		if (request.url().includes('fonts.g') || request.resourceType() === 'font') {
			fontRequests.push(request.url());
		}
	});

	const selfHostedFont = page.waitForResponse(
		(response) => response.url().includes('/_app/immutable/') && response.url().endsWith('.woff2')
	);
	await page.goto('/');

	const csp = await page
		.locator('meta[http-equiv="content-security-policy" i]')
		.getAttribute('content');
	expect(csp).toContain("default-src 'self'");
	expect(csp).toContain('https://analytics.platform.devantler.tech');
	expect(csp).not.toContain('fonts.googleapis.com');
	expect(csp).not.toContain('fonts.gstatic.com');
	expect(csp).toContain('sha256-'); // SvelteKit hashed the inline hydration script

	// The typography self-hosts under the policy — the variable fonts load from
	// the site origin — and the analytics script tag is still in the head.
	expect((await selfHostedFont).ok()).toBe(true);
	expect(
		fontRequests.filter((url) => !url.startsWith('http://localhost:4173/')),
		'no font request may leave the site origin'
	).toEqual([]);
	await expect(
		page.locator('script[src^="https://analytics.platform.devantler.tech/"]')
	).toHaveAttribute('defer', '');

	// Exercise the hydrated app under the enforced CSP: the contact form's
	// confirmation state only renders when the (hashed) hydration script ran.
	const form = page.locator('#kontakt');
	await form.getByLabel('Navn').fill('CSP Probe');
	await form.getByLabel('Telefon').fill('12 34 56 78');
	await form.getByLabel('Email').fill('csp@example.dk');
	await form.getByLabel('Besked').fill('CSP-probe: siden skal fungere med den nye politik.');
	await form.getByRole('button', { name: /send besked/i }).click();
	await expect(page.getByText(/din mailapp åbner/i)).toBeVisible();

	expect(violations, `CSP violations:\n${violations.join('\n')}`).toEqual([]);
});
