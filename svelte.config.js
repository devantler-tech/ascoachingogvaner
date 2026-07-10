import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Fully static site: every route is prerendered to plain HTML (see
		// src/routes/+layout.ts). No server runtime, database or SMTP.
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: true,
			strict: true
		}),
		// Content-Security-Policy for the prerendered pages, injected at build
		// time as a <meta http-equiv> tag with SvelteKit's own inline hydration
		// script hashed — so script-src needs no 'unsafe-inline'. Only the two
		// external origins the site actually uses are allow-listed (self-hosted
		// Umami analytics, Google Fonts). Transport headers (HSTS) and
		// frame-ancestors live in docker/security-headers.conf, because a meta
		// CSP cannot carry frame-ancestors.
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self', 'https://analytics.platform.devantler.tech'],
				'style-src': ['self', 'https://fonts.googleapis.com'],
				// SvelteKit's navigation announcer (the generated root.svelte)
				// mounts client-side with one constant inline style attribute;
				// allow exactly that attribute by hash instead of opening
				// style-src to 'unsafe-inline'. A SvelteKit upgrade that changes
				// the announcer's style breaks this hash — the security e2e test
				// fails loudly on the violation, pointing back here.
				'style-src-attr': [
					'unsafe-hashes',
					'sha256-S8qMpvofolR8Mpjy4kQvEm7m1q8clzU4dfDH0AmvZjo='
				],
				'font-src': ['self', 'https://fonts.gstatic.com'],
				'img-src': ['self'],
				'connect-src': ['self', 'https://analytics.platform.devantler.tech'],
				'object-src': ['none'],
				'base-uri': ['self']
			}
		}
	}
};

export default config;
