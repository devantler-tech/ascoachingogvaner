// Renders docker/nginx.conf.template into the final nginx config, substituting
// the booking URL from src/lib/site-config.json — the same single source the
// site code imports — so a booking-vendor change is a one-file edit (issue
// #100). Fails closed: a missing/odd URL or a template without exactly one
// placeholder aborts the build instead of shipping a broken redirect.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const outPath = process.argv[2] ?? 'build-docker/default.conf';

const { bookingUrl } = JSON.parse(readFileSync('src/lib/site-config.json', 'utf8'));

// nginx would treat whitespace/;/{ } as config syntax, # as a comment, $ as a
// variable, and quotes/backslash as escaping — a URL carrying any of them
// must never be substituted into the config.
if (typeof bookingUrl !== 'string' || !/^https:\/\/[^\s;{}#$"'\\]+$/.test(bookingUrl)) {
	throw new Error(`site-config.json bookingUrl is missing or not a plain https URL: ${bookingUrl}`);
}

const placeholder = '__BOOKING_URL__';
const template = readFileSync('docker/nginx.conf.template', 'utf8');
const occurrences = template.split(placeholder).length - 1;

if (occurrences !== 1) {
	throw new Error(`expected exactly one ${placeholder} in nginx.conf.template, found ${occurrences}`);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, template.replace(placeholder, bookingUrl));
console.log(`rendered ${outPath} (booking URL: ${bookingUrl})`);
