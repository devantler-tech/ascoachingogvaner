import { test, expect } from '@playwright/test';

test('homepage shows hero and primary CTA', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('overskud');
	await expect(page.getByRole('link', { name: /gratis startsamtale/i }).first()).toBeVisible();
});

test('navigation reaches all main pages', async ({ page }) => {
	await page.goto('/');
	for (const [path, heading] of [
		['/services', /coaching der møder dig/i],
		['/om-mig', /balancen/i],
		['/kontakt', /dit liv/i],
		['/book-tid', /første skridt/i]
	] as const) {
		await page.goto(path);
		await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(heading);
	}
});

test('services page lists all four offerings with prices', async ({ page }) => {
	await page.goto('/services');
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

test('contact form submits successfully', async ({ page }) => {
	await page.goto('/kontakt');
	await page.getByLabel('Navn').fill('Test Person');
	await page.getByLabel('Email').fill('test@example.dk');
	await page.getByLabel('Besked').fill('Dette er en testbesked.');
	await page.getByRole('button', { name: /send besked/i }).click();
	await expect(page.getByText(/din besked er sendt/i)).toBeVisible();
});

test('booking form preselects service from query and submits', async ({ page }) => {
	await page.goto('/book-tid?service=Vanecoaching');
	const service = page.getByLabel('Ydelse');
	await expect(service).toHaveValue('Vanecoaching');
	// The selection must be user-changeable (regression: it was previously bound
	// to read-only derived state).
	await service.selectOption('Stresscoaching');
	await expect(service).toHaveValue('Stresscoaching');
	await page.getByLabel('Navn').fill('Test Person');
	await page.getByLabel('Email').fill('test@example.dk');
	await page.getByRole('button', { name: /send forespørgsel/i }).click();
	await expect(page.getByText(/din forespørgsel er modtaget/i)).toBeVisible();
});

test('admin is reachable in dev-skip-auth mode', async ({ page }) => {
	await page.goto('/admin');
	await expect(page.getByRole('heading', { name: 'Bookinger' })).toBeVisible();
});
