import { test, expect, type Page } from '@playwright/test';

// Every link must stay on the site, start an email or a call, or open the map.
// This is an allow-list over every `a[href]`, so a link that leaves the site in
// any spelling (protocol-relative, an upper-case scheme, `javascript:`) is
// reported instead of skipped.
async function linksLeavingTheSite(page: Page): Promise<{ examined: number; leaving: string[] }> {
	return page.locator('a[href]').evaluateAll((links) => {
		const stays = (link: HTMLAnchorElement): boolean => {
			if ((link.getAttribute('href') ?? '').startsWith('#')) return true;
			// `link.href` is the resolved URL, so the scheme is already lower-case.
			const url = new URL(link.href);
			if (url.protocol === 'mailto:' || url.protocol === 'tel:') return true;
			if (url.origin === location.origin) return true;
			return (
				url.protocol === 'https:' && url.host === 'www.google.com' && url.pathname.startsWith('/maps/')
			);
		};
		const anchors = links as HTMLAnchorElement[];
		return {
			examined: anchors.length,
			leaving: anchors.filter((link) => !stays(link)).map((link) => link.getAttribute('href') ?? '')
		};
	});
}

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

test('booking buttons lead to the contact section (#318)', async ({ page }) => {
	await page.goto('/');

	// Nav and footer "Book tid", the hero button and one button per service:
	// all stay on the page and scroll to the contact form and email address.
	const bookLinks = page.getByRole('link', { name: /^book /i }).filter({ hasNotText: /via mail/i });
	await expect(bookLinks).toHaveCount(7);
	for (const link of await bookLinks.all()) {
		await expect(link).toHaveAttribute('href', '#kontakt');
		await expect(link).not.toHaveAttribute('target', /.*/);
	}

	await page.getByRole('navigation').getByRole('link', { name: /book tid/i }).first().click();
	await expect(page.getByRole('heading', { name: /dit liv/i }).first()).toBeInViewport();
});

test('the free intro can be booked by email (#318)', async ({ page }) => {
	await page.goto('/');
	const mailLink = page.getByRole('link', { name: /book via mail/i });
	await expect(mailLink).toHaveAttribute('href', /^mailto:[^?]+@[^?]+\?subject=Gratis%20startsamtale$/);
});

test('the "Book via mail" link is the tracked booking click (#318)', async ({ page }) => {
	// Stand in for the Umami tracker so the test records what the page sends.
	await page.route('https://analytics.platform.devantler.tech/**', (route) => route.abort());
	await page.addInitScript(() => {
		const sent: string[] = [];
		Object.assign(window, { umamiSent: sent, umami: { track: (event: string) => sent.push(event) } });
	});
	await page.goto('/');
	const sent = () => page.evaluate(() => (window as unknown as { umamiSent: string[] }).umamiSent);

	// The hero button only scrolls to the contact section, so it sends nothing.
	await page.locator('#top').getByRole('link', { name: /gratis startsamtale/i }).click();
	await expect(page.getByRole('heading', { name: /dit liv/i }).first()).toBeInViewport();
	expect(await sent()).toEqual([]);

	await page.getByRole('link', { name: /book via mail/i }).click();
	await expect.poll(sent).toEqual(['book-mail-click']);
});

test('no link leaves the site except the map (#318)', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('a[href^="https://www.google.com/maps/"]').first()).toBeAttached();
	const { examined, leaving } = await linksLeavingTheSite(page);
	expect(examined).toBeGreaterThan(10);
	expect(leaving).toEqual([]);
});

test('the link check reports every spelling of a link that leaves the site (#318)', async ({ page }) => {
	await page.goto('/');
	const leaving = [
		'//booking.example/book',
		'HTTPS://booking.example/book',
		'http://www.google.com/maps/search/',
		'https://www.google.com/booking',
		'javascript:void(0)'
	];
	const staying = ['#kontakt', 'MAILTO:x@example.dk', 'tel:+4512345678', '/om-mig'];
	await page.evaluate((hrefs) => {
		for (const href of hrefs) {
			const link = document.createElement('a');
			link.setAttribute('href', href);
			document.body.append(link);
		}
	}, [...leaving, ...staying]);
	expect((await linksLeavingTheSite(page)).leaving).toEqual(leaving);
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
