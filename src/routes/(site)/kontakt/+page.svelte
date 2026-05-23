<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import ContactForm from '$lib/components/ContactForm.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { contact, site } from '$lib/content.js';
</script>

<svelte:head>
	<title>Kontakt — AS Coaching og Vaner</title>
	<meta name="description" content={contact.lead} />
</svelte:head>

<Section eyebrow="Kontakt" title={contact.lead} intro={contact.text}>
	<div class="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
		<div class="rounded-3xl border border-sage-100 bg-surface p-7 shadow-soft sm:p-9">
			<ContactForm />
		</div>

		<div class="space-y-4">
			<a
				href="mailto:{site.email}"
				class="flex items-center gap-4 rounded-2xl border border-sage-100 bg-surface p-5 transition-colors hover:border-sage-300"
			>
				<span class="grid h-11 w-11 place-items-center rounded-xl bg-sage-50 text-sage-500">
					<Icon name="mail" size={20} />
				</span>
				<span>
					<span class="block text-sm text-muted">Email</span>
					<span class="font-medium text-forest-900">{site.email}</span>
				</span>
			</a>
			<a
				href="tel:{site.phone.replace(/\s/g, '')}"
				class="flex items-center gap-4 rounded-2xl border border-sage-100 bg-surface p-5 transition-colors hover:border-sage-300"
			>
				<span class="grid h-11 w-11 place-items-center rounded-xl bg-sage-50 text-sage-500">
					<Icon name="phone" size={20} />
				</span>
				<span>
					<span class="block text-sm text-muted">Telefon</span>
					<span class="font-medium text-forest-900">{site.phone}</span>
				</span>
			</a>
			<div class="rounded-2xl bg-sage-50 p-5">
				<div class="flex items-center gap-2 text-forest-900">
					<Icon name="clock" size={18} />
					<h2 class="text-base">Foretrækker du at booke direkte?</h2>
				</div>
				<p class="mt-2 text-sm text-muted">
					Du kan altid bestille en gratis startsamtale eller et forløb via booking-siden.
				</p>
				<a
					href="/book-tid"
					class="mt-3 inline-flex items-center gap-2 text-sm font-medium text-forest-700 hover:text-forest-900"
				>
					Gå til Book tid
					<Icon name="arrow" size={16} />
				</a>
			</div>
		</div>
	</div>
</Section>
