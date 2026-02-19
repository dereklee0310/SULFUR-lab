<script lang="ts">
	import '$lib/i18n';
	import { _ } from 'svelte-i18n';
	import './layout.css';

	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index';
	import * as Empty from "$lib/components/ui/empty/index.js";
	import { Spinner } from "$lib/components/ui/spinner/index.js";
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { navigationMenuTriggerStyle } from '$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte';

	import { resolve } from '$app/paths';
	import { locale, locales, isLoading } from 'svelte-i18n';
	import { toggleMode } from 'mode-watcher';
	import { ModeWatcher } from 'mode-watcher';
	import { cn } from '$lib/utils.js';
	import { BORDER_STYLE } from '$lib/utils';
	import { Github, Globe, Navigation, Sun, Moon } from '@lucide/svelte';
	import logo from '$lib/assets/favicon.png';


	import {  } from 'svelte-i18n';

	let { children } = $props();

	const navItemStyle = navigationMenuTriggerStyle({ class: 'h-14 text-lg' });
	const iconStyle = 'h-6 fill-current';

	const LANGUAGES: Record<string, string> = {
		en: 'English',
		sv: 'Svenska',
		fr: 'Français',
		it: 'Italiano',
		de: 'Deutsch',
		es: 'Español',
		pt: 'Português',
		ru: 'Русский',
		pl: 'Polski',
		ja: '日本語',
		ko: '한국어',
		'zh-CN': '简体中文',
		tr: 'Türkçe'
	};
</script>

<svelte:head><title>SULFUR Lab</title> <link rel="icon" href={logo} /></svelte:head>

{#snippet loadingPage()}
<Empty.Root class="w-full">
  <Empty.Header>
    <Empty.Media>
      <Spinner class="size-20"/>
    </Empty.Media>
    <Empty.Title>Loading...</Empty.Title>
  </Empty.Header>
  <Empty.Content>
  </Empty.Content>
</Empty.Root>
{/snippet}

{#snippet leftNavigationMenu()}
	<NavigationMenu.Root class="justify-start">
		<NavigationMenu.List>
			<NavigationMenu.Item>
				<NavigationMenu.Link>
					{#snippet child()}
						<a href={resolve('/')} class={navItemStyle + ' flex items-center gap-x-2'}>
							<img class={iconStyle} src={logo} alt="favicon" />
							SULFUR Lab
						</a>
					{/snippet}
				</NavigationMenu.Link>
			</NavigationMenu.Item>
			<!-- <NavigationMenu.Item>
					<NavigationMenu.Link>
						{#snippet child()}
							<a href="/" class={navItemStyle}>Build Weapon</a>
						{/snippet}
					</NavigationMenu.Link>
				</NavigationMenu.Item> -->
			<!-- <NavigationMenu.Item>
					<NavigationMenu.Link>
						{#snippet child()}
							<a href="/popular" class={navItemStyle}>Popular</a>
						{/snippet}
					</NavigationMenu.Link>
				</NavigationMenu.Item> -->
		</NavigationMenu.List>
	</NavigationMenu.Root>
{/snippet}

{#snippet rightNavigationMenu()}
	<NavigationMenu.Root class="ml-auto justify-start">
		<NavigationMenu.List class="flex">
			<NavigationMenu.Item>
				<NavigationMenu.Link>
					{#snippet child()}
						<a href={resolve('/about')} class={navItemStyle}>{$_('pages.about.title')}</a>
					{/snippet}
				</NavigationMenu.Link>
			</NavigationMenu.Item>

			<NavigationMenu.Item>
				<NavigationMenu.Link>
					{#snippet child()}
						<a
							href="https://github.com/dereklee0310/SULFUR-lab"
							target="_blank"
							rel="noopener"
							aria-label="GitHub"
							class={navItemStyle}
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class={iconStyle}>
								<path
									d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
								/>
							</svg>
						</a>
						<!-- <Github \> -->
					{/snippet}
				</NavigationMenu.Link>
			</NavigationMenu.Item>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class={navItemStyle}>
					<Globe />
				</DropdownMenu.Trigger>

				<DropdownMenu.Content align="center" class={cn('w-32', BORDER_STYLE)}>
					<DropdownMenu.RadioGroup bind:value={$locale!}>
						{#each $locales as l}
							<DropdownMenu.RadioItem value={l}>
								{LANGUAGES[l]}
							</DropdownMenu.RadioItem>
						{/each}
					</DropdownMenu.RadioGroup>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<NavigationMenu.Item>
				{#snippet child()}
					<button
						onclick={toggleMode}
						class={navigationMenuTriggerStyle({
							class: 'h-14 focus:bg-background! focus:text-foreground!'
						})}
						aria-label="Toggle theme"
					>
						<Sun
							class="h-6 w-6 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
						/>
						<Moon
							class="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
						/>
					</button>
				{/snippet}
			</NavigationMenu.Item>
		</NavigationMenu.List>
	</NavigationMenu.Root>
{/snippet}

<Toaster position="top-center" />

<div class="flex h-dvh flex-col">
	{#if $isLoading}
		{@render loadingPage()}
	{:else}
		<nav class="mx-auto flex w-full px-2 py-2">
			{@render leftNavigationMenu()}
			{@render rightNavigationMenu()}
		</nav>
		<ModeWatcher defaultMode={'dark'} />

		<Tooltip.Provider>
			<main class="min-h-0 flex-1">
				{@render children()}
			</main>
		</Tooltip.Provider>
	{/if}
</div>
