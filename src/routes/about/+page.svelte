<script>
	import { _ } from 'svelte-i18n';
</script>

<div class="flex h-full flex-col justify-evenly gap-8 px-54 py-16">
	<div class="flex flex-col gap-2">
		<h1 class="w-full scroll-m-20 text-xl lg:text-3xl">{$_('pages.about.title')}</h1>
		<p class="text-xl">
			{$_('pages.about.text')}
		</p>
	</div>
	<div class="flex flex-col gap-2">
		<h1 class="w-full scroll-m-20 text-xl lg:text-3xl">{$_('pages.copyrightNotice.title')}</h1>
		<p class="text-xl">
			{$_('pages.copyrightNotice.text')}
		</p>
	</div>
	<div class="flex flex-col gap-2">
		<h1 class="w-full scroll-m-20 text-xl lg:text-3xl">{$_('pages.contact.title')}</h1>
		<div class="flex flex-row gap-2 text-xl">
			<a
				href="https://github.com/dereklee0310/SULFUR-lab/issues"
				target="_blank"
				rel="noopener"
				aria-label="GitHub"
				class="underline">GitHub</a
			>
			<a
				href="https://discord.gg/rNuATBPr9y"
				target="_blank"
				rel="noopener"
				aria-label="Discord"
				class="underline">Discord</a
			>
			<a
				href="mailto:dereklee0310@gmail.com"
				target="_blank"
				rel="noopener"
				aria-label="mail"
				class="underline">Mail</a
			>
		</div>
	</div>
	<div class="flex flex-col gap-2">
		<h1 class="w-full scroll-m-20 text-xl lg:text-3xl">{$_('pages.donate.title')}</h1>
		<p class="text-xl">
			{@html $_('pages.donate.text')}
		</p>
	</div>
</div>
