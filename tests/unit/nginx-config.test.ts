import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import siteConfig from '../../src/lib/site-config.json';
import { site } from '../../src/lib/content.js';

// Runs the real render script the Docker build runs, so the test pins the
// actual tool rather than a re-implementation of it (issue #100).
const renderScript = 'docker/render-nginx-conf.mjs';

let outDir: string | undefined;

afterEach(() => {
	if (outDir) {
		rmSync(outDir, { recursive: true, force: true });
		outDir = undefined;
	}
});

function renderConf(): string {
	outDir = mkdtempSync(join(tmpdir(), 'nginx-conf-'));

	const outPath = join(outDir, 'default.conf');
	execFileSync('node', [renderScript, outPath]);

	return readFileSync(outPath, 'utf8');
}

describe('booking URL single source', () => {
	it('renders the /book-tid redirect from site-config.json', () => {
		const conf = renderConf();

		expect(conf).toContain(`location = /book-tid { return 301 ${siteConfig.bookingUrl}; }`);
		expect(conf).not.toContain('__BOOKING_URL__');
	});

	it('feeds the same URL to the site code', () => {
		expect(site.bookingUrl).toBe(siteConfig.bookingUrl);
	});

	it('keeps the template free of a hardcoded booking host', () => {
		const template = readFileSync('docker/nginx.conf.template', 'utf8');
		const bookingHost = new URL(siteConfig.bookingUrl).host;

		expect(template).not.toContain(bookingHost);
		expect(template).toContain('__BOOKING_URL__');
	});

	// nginx reads # as a comment and $ as a variable inside `return 301 ...;`,
	// so a vendor URL carrying either must abort the render instead of shipping
	// a config that breaks or redirects wrong. The last cases pass the character
	// class but do not parse as an https URL with a hostname — a config typo
	// that must fail the build rather than ship an unusable Location target.
	it.each([
		'https://vendor.example/#/book',
		'https://vendor.example/book$id',
		'https://vendor.example/"book"',
		'https://?book',
		'https://%',
	])(
		'rejects a booking URL with nginx metacharacters: %s',
		(badUrl) => {
			outDir = mkdtempSync(join(tmpdir(), 'nginx-conf-'));
			mkdirSync(join(outDir, 'src/lib'), { recursive: true });
			mkdirSync(join(outDir, 'docker'), { recursive: true });
			cpSync('docker/nginx.conf.template', join(outDir, 'docker/nginx.conf.template'));
			cpSync(renderScript, join(outDir, renderScript));
			writeFileSync(join(outDir, 'src/lib/site-config.json'), JSON.stringify({ ...siteConfig, bookingUrl: badUrl }));

			expect(() => execFileSync('node', [renderScript, join(outDir, 'out/default.conf')], { cwd: outDir })).toThrow(
				/not a plain https URL/,
			);
		},
	);
});
