// Thin wrapper around the self-hosted Umami tracker. The analytics script is
// loaded in app.html and attaches `window.umami` once it has initialised; until
// then — and in local dev or SSR, where the script is absent — every call is a
// safe no-op. We only ever send a coarse, hard-coded event name: never form
// contents, email, phone or any other PII, so the lead funnel stays measurable
// while remaining privacy-first.

export type UmamiEvent = 'contact-submit' | 'book-intro-click';

interface Umami {
	track: (event: string) => void;
}

declare global {
	interface Window {
		umami?: Umami;
	}
}

export function trackEvent(event: UmamiEvent): void {
	if (typeof window === 'undefined') return;
	try {
		window.umami?.track(event);
	} catch {
		// Analytics must never break the user-facing action (submit / booking).
	}
}
