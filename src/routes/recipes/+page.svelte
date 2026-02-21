<script lang="ts">
	import { _ } from 'svelte-i18n';

	import Fuse from 'fuse.js';

	import { Search, SearchX, X, ArrowRight, Plus } from '@lucide/svelte';

	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Item from '$lib/components/ui/item/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js'; // Added Pagination Import
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { type ItemData } from '$lib/components/sulfur-lab/utils';
	import { BORDER_STYLE } from '$lib/utils';
	import recipeDataList from '$lib/assets/recipes.json';

	let searchQuery = $state('');
	let activeSearch = $state('');

	// Pagination State
	let currentPage = $state(1);
	const perPage = 50;

	let topAnchor: HTMLDivElement;

	$effect(() => {
		currentPage;

		// Scroll the anchor into view smoothly
		if (topAnchor) {
			topAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	});

	let searchTimer: ReturnType<typeof setTimeout>;
	function handleSearchInput(e: Event) {
		const target = e.target as HTMLInputElement;
		searchQuery = target.value;

		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			activeSearch = searchQuery;
		}, 300);
	}

	// Reset to page 1 whenever the search query changes
	$effect(() => {
		activeSearch;
		currentPage = 1;
	});

	const localizedRecipeDataList = $derived(
		recipeDataList.map((recipeData) => ({
			...recipeData,
			searchName: $_(`Items/${recipeData.name}`),
			itemsNeeded: recipeData.itemsNeeded.map((item) => ({
				...item,
				searchName: $_(`Items/${item.name}`)
			}))
		}))
	);

	const fuse = $derived(
		new Fuse(localizedRecipeDataList, {
			keys: [
				{ name: 'searchName', weight: 2 },
				{ name: 'itemsNeeded.searchName', weight: 1 }
			],
			minMatchCharLength: 1,
			threshold: 0.4
		})
	);

	const searchResults = $derived.by(() => {
		const query = activeSearch.trim();
		return query === '' ? localizedRecipeDataList : fuse.search(query).map((r) => r.item);
	});

	// Derive the subset of results to display based on current page
	const paginatedResults = $derived.by(() => {
		const start = (currentPage - 1) * perPage;
		const end = start + perPage;
		return searchResults.slice(start, end);
	});
</script>

{#snippet recipe(recipeData: ItemData)}
	<div
		class={`text flex h-full flex-row items-center justify-between rounded-md bg-background p-2 ${BORDER_STYLE}`}
	>
		<div class="flex flex-row items-center gap-x-2 text-sm font-medium text-(--card-text)">
			{#each recipeData.itemsNeeded as itemData, i (i)}
				<div class="flex w-24 flex-col items-center text-center">
					{#await import(`$lib/assets/assets/${itemData.artwork}.png`) then { default: src }}
						<img {src} alt={itemData.name} class="h-10 w-auto rounded-sm object-contain" />
					{/await}
					<span class="mt-1 leading-tight">
						{$_(`Items/${itemData.name}`)} <br /> x{itemData.quantity}
					</span>
				</div>
				{#if i !== recipeData.itemsNeeded.length - 1}
					<Plus class="shrink-0" />
				{/if}
			{/each}

			<ArrowRight class="mx-2 shrink-0" />

			<div class="flex w-24 flex-col items-center text-center">
				{#await import(`$lib/assets/assets/${recipeData.artwork}.png`) then { default: src }}
					<img {src} alt={recipeData.name} class="h-10 w-auto rounded-sm object-contain" />
				{/await}
				<span class="mt-1 leading-tight">
					{$_(`Items/${recipeData.name}`)} <br /> x{recipeData.quantity}
				</span>
			</div>
		</div>

		<div class="ml-auto flex flex-col items-end border-border/50 pr-4 ">
			<span class="text-xs text-muted-foreground line-through">
				{recipeData.oldPrice}
			</span>
			<span class="text-lg font-bold text-foreground">
				{recipeData.newPrice}
			</span>

			{#if recipeData.oldPrice && recipeData.newPrice}
				{@const diff = recipeData.newPrice - recipeData.oldPrice}
				{@const percent = ((diff / recipeData.oldPrice) * 100).toFixed(1)}

				<span class={`text-xs font-semibold ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
					{diff >= 0 ? '▲' : '▼'}
					{Math.abs(diff)} ({percent}%)
				</span>
			{/if}
		</div>
	</div>
{/snippet}
<div class="flex h-full min-h-0 flex-1 flex-col gap-4 rounded-md p-12">
	<InputGroup.Root class={`shrink-0 ${BORDER_STYLE}`}>
		<InputGroup.Input
			placeholder={$_('pages.build.search')}
			bind:value={searchQuery}
			oninput={handleSearchInput}
		/>
		<InputGroup.Addon align="inline-end">
			<InputGroup.Button>
				<Search />
			</InputGroup.Button>
		</InputGroup.Addon>
	</InputGroup.Root>

	<ScrollArea class="min-h-0 w-full flex-1 rounded-md border-2">
		<div bind:this={topAnchor}></div>
		{#if paginatedResults.length > 0}
			<Item.Group class="grid grid-cols-1 items-stretch gap-2 p-2">
				{#each paginatedResults as recipeData (recipeData.recipeName)}
					{@render recipe(recipeData)}
				{/each}
			</Item.Group>
		{:else}
			<Empty.Root class="h-full">
				<Empty.Header>
					<Empty.Media>
						<SearchX />
					</Empty.Media>
					<Empty.Title>{$_('pages.build.noItemFound')}</Empty.Title>
					<Empty.Description>{$_('pages.build.noItemFoundDesc')}</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		{/if}
	</ScrollArea>

	{#if searchResults.length > perPage}
		<div class="flex shrink-0 justify-center pt-2">
			<Pagination.Root count={searchResults.length} {perPage} bind:page={currentPage}>
				{#snippet children({ pages, currentPage })}
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.PrevButton />
						</Pagination.Item>
						{#each pages as page (page.key)}
							{#if page.type === 'ellipsis'}
								<Pagination.Item>
									<Pagination.Ellipsis />
								</Pagination.Item>
							{:else}
								<Pagination.Item>
									<Pagination.Link {page} isActive={currentPage === page.value}>
										{page.value}
									</Pagination.Link>
								</Pagination.Item>
							{/if}
						{/each}
						<Pagination.Item>
							<Pagination.NextButton />
						</Pagination.Item>
					</Pagination.Content>
				{/snippet}
			</Pagination.Root>
		</div>
	{/if}
</div>
