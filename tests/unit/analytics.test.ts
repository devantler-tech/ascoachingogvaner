import { describe, it, expect, vi, afterEach } from 'vitest';
import { trackEvent } from '../../src/lib/analytics.js';

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('trackEvent', () => {
	it('is a no-op (no throw) when window is undefined, e.g. SSR / node', () => {
		// `window` is not defined in the node test environment.
		expect(() => trackEvent('contact-submit')).not.toThrow();
	});

	it('does not throw before the Umami script has attached window.umami', () => {
		vi.stubGlobal('window', {});
		expect(() => trackEvent('book-intro-click')).not.toThrow();
	});

	it('forwards the event name to umami.track when the tracker is present', () => {
		const track = vi.fn();
		vi.stubGlobal('window', { umami: { track } });
		trackEvent('contact-submit');
		expect(track).toHaveBeenCalledTimes(1);
		expect(track).toHaveBeenCalledWith('contact-submit');
	});

	it('sends only the coarse event name — never a PII payload', () => {
		const track = vi.fn();
		vi.stubGlobal('window', { umami: { track } });
		trackEvent('book-intro-click');
		// Exactly one argument: the event-name string, nothing else.
		expect(track.mock.calls[0]).toEqual(['book-intro-click']);
	});

	it('swallows tracker errors so analytics never breaks the user action', () => {
		const track = vi.fn(() => {
			throw new Error('network down');
		});
		vi.stubGlobal('window', { umami: { track } });
		expect(() => trackEvent('contact-submit')).not.toThrow();
	});
});
