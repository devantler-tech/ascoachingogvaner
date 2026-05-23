interface SubmitState {
	saved: boolean;
	error: boolean;
}

type StateUpdater = (state: SubmitState) => void;

const SAVED_TIMEOUT_MS = 6000;
const ERROR_TIMEOUT_MS = 6000;

export function createSubmitHandler(update: StateUpdater, onSuccess?: () => void) {
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
				setTimeout(() => update({ saved: false, error: false }), SAVED_TIMEOUT_MS);
			} else {
				update({ saved: false, error: true });
				setTimeout(() => update({ saved: false, error: false }), ERROR_TIMEOUT_MS);
			}
		} catch {
			update({ saved: false, error: true });
			setTimeout(() => update({ saved: false, error: false }), ERROR_TIMEOUT_MS);
		}
	};
}
