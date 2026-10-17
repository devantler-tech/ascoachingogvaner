import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { bookingHref } from '../../src/lib/content.js';

// The Docker image copies this file verbatim, so the test reads the exact
// config nginx serves.
const conf = readFileSync('docker/nginx.conf', 'utf8');

describe('legacy redirects', () => {
	it('sends the old booking page to the contact section the site links to', () => {
		expect(conf).toContain(`location = /book-tid { return 301 /${bookingHref}; }`);
	});

	it('keeps the old multi-page routes pointing at their sections', () => {
		expect(conf).toContain('location = /services { return 301 /#services; }');
		expect(conf).toContain('location = /om-mig { return 301 /#om-mig; }');
		expect(conf).toContain('location = /kontakt { return 301 /#kontakt; }');
	});

	// Without this nginx builds an absolute Location from its own scheme and
	// port (http://<host>:8080/...), which visitors behind the gateway cannot reach.
	it('sends relative redirects so visitors keep the public https origin', () => {
		expect(conf).toMatch(/^\s*absolute_redirect off;$/m);
	});

	it('does not link to any external booking system', () => {
		expect(conf).not.toMatch(/return 301 https?:/);
	});
});

describe('page caching', () => {
	// Pages must revalidate on every visit: a heuristically cached page from
	// before a deploy names hashed /_app/immutable assets the new image no longer
	// contains. Declaring add_header in a location drops the server-level
	// security headers, so the same block must include the snippet again.
	function pageLocation(): string {
		const block = /location \/ \{([^}]*)\}/.exec(conf);
		if (!block) throw new Error('the catch-all page location must exist');
		return block[1];
	}

	it('revalidates pages instead of letting browsers reuse them heuristically', () => {
		expect(pageLocation()).toMatch(/add_header Cache-Control "no-cache";/);
	});

	it('keeps the security headers on pages', () => {
		expect(pageLocation()).toContain('include /etc/nginx/snippets/security-headers.conf;');
	});

	it('still caches hashed build assets as immutable', () => {
		expect(conf).toMatch(/location \/_app\/immutable\/ \{[^}]*add_header Cache-Control "public, immutable";/);
	});
});
