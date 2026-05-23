interface SubmitState {
	saved: boolean;
	error: boolean;
}

type StateUpdater = (state: SubmitState) => void;

const SAVED_TIMEOUT_MS = 6000;
const ERROR_TIMEOUT_MS = 6000;

export function createSubmitHandler(update: StateUpdater, onSuccess?: () => void) {
	let resetTimer: ReturnType<typeof setTimeout> | undefined;
	// Clear any pending reset before scheduling a new one so rapid re-submits
	// can't have a stale timer flip the banner state after a later submit.
	const scheduleReset = (ms: number) => {
		clearTimeout(resetTimer);
		resetTimer = setTimeout(() => update({ saved: false, error: false }), ms);
	};

	return async (e: SubmitEvent) => {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		try {
			const res = await fetch(form.action, {
				method: 'POST',
				body: new FormData(form)
			});
			if (res.ok) {
				update({ saved: true, error: false });
				form.reset();
				onSuccess?.();
				scheduleReset(SAVED_TIMEOUT_MS);
			} else {
				update({ saved: false, error: true });
				scheduleReset(ERROR_TIMEOUT_MS);
			}
		} catch {
			update({ saved: false, error: true });
			scheduleReset(ERROR_TIMEOUT_MS);
		}
	};
}
