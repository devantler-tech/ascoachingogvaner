import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const templateOnlyScripts = [
	'scripts/agent-instructions.test.sh',
	'scripts/platform-network-floor-contract.test.sh',
	'scripts/platform-network-floor.test.sh',
	'scripts/platform-tenant-envelope-contract.test.sh',
	'scripts/platform-tenant-envelope.test.sh',
	'scripts/platform-vpa-floor-contract.test.sh',
	'scripts/platform-vpa-floor.test.sh',
	'scripts/pod-security-admission-contract.test.sh',
	'scripts/pod-security-admission.test.sh',
	'scripts/tenant-ci-contract.test.sh',
	'scripts/tenant-rbac-contract.test.sh',
	'scripts/tenant-rbac.test.sh'
];

describe('.templatesyncignore', () => {
	it('keeps template-only validation scripts out of the live tenant', () => {
		const ignoreFile = readFileSync(new URL('../../.templatesyncignore', import.meta.url), 'utf8');
		const ignoredPaths = new Set(
			ignoreFile
				.split('\n')
				.map((line) => line.trim())
				.filter((line) => line.length > 0 && !line.startsWith('#'))
		);

		expect(templateOnlyScripts.filter((path) => !ignoredPaths.has(path))).toEqual([]);
	});
});
