import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

// Accessibility is a tested invariant for this public client-facing site (see AGENTS.md).
// Run axe at WCAG 2.1 A/AA and fail on critical/serious findings only — minor/moderate
// noise (e.g. generated form-element contrast hints) is intentionally not gated.
async function checkA11y(page: import('@playwright/test').Page) {
	const results = await new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
		.analyze();
	const blocking = results.violations.filter((v) =>
		['critical', 'serious'].includes(v.impact as string)
	);
	expect(blocking, `a11y violations:\n${JSON.stringify(blocking, null, 2)}`).toEqual([]);
}

// The site is a single prerendered page; `/` carries the hero plus every section
// (services, om-mig, kontakt), so one scan covers the whole public surface.
test('home page has no critical/serious WCAG 2.1 AA violations', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await checkA11y(page);
});

// The contact form's submitted-confirmation state is rendered client-side after the
// section is already in the DOM — re-scan once it is shown so the success message and
// the form's post-submit markup stay accessible too.
test('contact-form confirmation state has no critical/serious WCAG 2.1 AA violations', async ({
	page
}) => {
	await page.goto('/');
	const form = page.locator('#kontakt');
	await form.getByLabel('Navn').fill('Test Person');
	await form.getByLabel('Telefon').fill('12 34 56 78');
	await form.getByLabel('Email').fill('test@example.dk');
	await form.getByLabel('Besked').fill('Jeg vil gerne høre mere om stresscoaching.');
	await form.getByRole('button', { name: /send besked/i }).click();
	await expect(page.getByText(/din mailapp åbner/i)).toBeVisible();
	await checkA11y(page);
});
