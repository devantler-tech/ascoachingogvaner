import { text } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

// Lightweight liveness/readiness probe — no DB access.
export const GET: RequestHandler = () => text('ok');
