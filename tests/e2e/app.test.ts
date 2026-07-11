import { test, expect } from '@playwright/test';

test('homepage shows hero and primary CTA', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('overskud');
	await expect(page.getByRole('link', { name: /gratis startsamtale/i }).first()).toBeVisible();
	// The responsive hero image (enhanced:img <picture>) renders with its alt text.
	await expect(page.getByRole('img', { name: /Alette, coach/i })).toBeVisible();
});

test('nav links scroll to the matching sections on one page', async ({ page }) => {
	await page.goto('/');
	const navbar = page.getByRole('navigation');
	for (const [name, heading] of [
		[/services/i, /coaching der møder dig/i],
		[/om mig/i, /indre ro/i],
		[/kontakt/i, /dit liv/i]
	] as const) {
		await navbar.getByRole('link', { name }).first().click();
		await expect(page.getByRole('heading', { name: heading }).first()).toBeInViewport();
	}
});

test('Book tid links out to the external booking system', async ({ page }) => {
	await page.goto('/');
	const bookCta = page.getByRole('navigation').getByRole('link', { name: /book tid/i }).first();
	await expect(bookCta).toHaveAttribute('href', 'https://ascoaching.book.dk');
	await expect(bookCta).toHaveAttribute('target', '_blank');
});

test('services section lists all four offerings with prices', async ({ page }) => {
	await page.goto('/');
	for (const title of [
		'Stresscoaching',
		'Angstvejledning',
		'Vanecoaching',
		'Overspisningscoaching'
	]) {
		await expect(page.getByRole('heading', { name: title })).toBeVisible();
	}
	await expect(page.getByText('800 kr.').first()).toBeVisible();
});

test('contact form opens a prefilled email', async ({ page }) => {
	await page.goto('/');
	const form = page.locator('#kontakt');
	await form.getByLabel('Navn').fill('Test Person');
	await form.getByLabel('Telefon').fill('12 34 56 78');
	await form.getByLabel('Email').fill('test@example.dk');
	await form.getByLabel('Besked').fill('Jeg vil gerne høre mere om stresscoaching.');
	await form.getByRole('button', { name: /send besked/i }).click();
	await expect(page.getByText(/din mailapp åbner/i)).toBeVisible();
});

test('contact form reports Danish validation messages', async ({ page }) => {
	await page.goto('/');
	const form = page.locator('#kontakt');

	// Submitting empty: required fields report a Danish message.
	await form.getByRole('button', { name: /send besked/i }).click();
	await expect(form.getByLabel('Navn')).toHaveJSProperty(
		'validationMessage',
		'Udfyld venligst dette felt.'
	);
});

test('typography renders with the self-hosted font families (#98)', async ({ page }) => {
	await page.goto('/');

	// The brand fonts are same-origin build assets; the computed styles must
	// resolve to them (a broken @import or family rename would silently fall
	// back to Georgia/system-ui).
	const headingFont = await page
		.getByRole('heading', { level: 1 })
		.evaluate((el) => getComputedStyle(el).fontFamily);
	expect(headingFont).toContain('Lora Variable');

	const bodyFont = await page
		.locator('body')
		.evaluate((el) => getComputedStyle(el).fontFamily);
	expect(bodyFont).toContain('Inter Variable');

	// Both families report as loaded by the CSS Font Loading API.
	const loaded = await page.evaluate(async () => {
		await document.fonts.ready;

		return {
			lora: document.fonts.check('16px "Lora Variable"'),
			inter: document.fonts.check('16px "Inter Variable"')
		};
	});
	expect(loaded).toEqual({ lora: true, inter: true });
});
