<script lang="ts">
	import {
		Search,
		UtensilsIcon,
		Undo,
		Redo,
		Import,
		RotateCcw,
		BookOpenText,
		Shuffle,
		ArrowDownNarrowWide,
		ArrowUpNarrowWide,
		Shapes,
		SlidersHorizontal,
		ScrollText,
		AlarmSmoke,
		CopyCheck,
		Copy,
		ShieldCheck,
		ShieldX,
		SearchX,
		CircleQuestionMark,
		CircleAlert
	} from '@lucide/svelte';

	import {
		MediaQuery,
		SvelteDate,
		SvelteMap,
		SvelteSet,
		SvelteURL,
		SvelteURLSearchParams,
		createSubscriber
	} from 'svelte/reactivity';

	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Item from '$lib/components/ui/item/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { buttonVariants } from '$lib/components/ui/button';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';

	import fieldMapping from '$lib/assets/fieldMapping.json';

	import { WeaponCard } from '$lib/components/sulfur-lab/weapon-card/index';
	import {
		Build,
		ItemDataList,
		encodeBuild,
		decodeBuild,
		getItemData,
		type ItemData
	} from '$lib/components/sulfur-lab/utils';

	import { BORDER_STYLE } from '$lib/utils';

	import Fuse from 'fuse.js';
	import { options } from '$lib/utils';

	const INSURANCE_ID = '-3043867419849264995';

	const ITEM_TYPE_MAPPING: Record<string, string> = {
		oil: 'Enchantment',
		scroll: 'Elemental enchantment',
		muzzle: 'Attachment',
		scope: 'Attachment',
		laserSight: 'Attachment',
		chamber: 'Attachment',
		insurance: 'Attachment'
	};

	const SINGLE_SLOT_TYPES = new Set([
		'muzzle',
		'scope',
		'laserSight',
		'chamber',
		'insurance',
		'weapon',
		'chamberChisel'
	]);

	const fuse = new Fuse(ItemDataList, options);

	let selectedItems = $state(new SvelteMap<string, ItemData>());
	let invalidEnchantment = $state(false);
	let invalidChamberChisel = $state(false);

	// Build & Import/Export State
	let buildCode: string = $state('');
	let isInputFocused = $state(false);
	let copied = $state(false);

	// UI & Filtering State
	let showWeapon = $state(true);
	let showChamberChisel = $state(true);
	let showEnchantment = $state(true);
	let showAttachment = $state(true);
	let sortBy = $state('default');
	let searchQuery = $state('');
	let activeSearch = $state('');

	// History (Undo/Redo) State
	let undoStack = $state<ItemData[][]>([]);
	let redoStack = $state<ItemData[][]>([]);

	// Derived states
	const getSelectedItems = () => [...selectedItems.values()];

	const allSelected = $derived(
		showWeapon && showChamberChisel && showEnchantment && showAttachment
	);

	let buildData: Build = $derived.by(() => {
		const items = getSelectedItems();

		return new Build(
			items.find((i) => i.type === 'weapon'),
			items.find((i) => i.type === 'chamberChisel'),
			items.filter((i) => i.type === 'scroll' || i.type === 'oil'),
			items.filter((i) =>
				['muzzle', 'scope', 'laserSight', 'chamber', 'insurance'].includes(i.type)
			)
		);
	});

	const durability = $derived(buildData.weapon?.maxDurability ?? '???');

	const searchResults = $derived.by(() => {
		const query = activeSearch.trim();
		const filters = { showWeapon, showChamberChisel, showEnchantment, showAttachment };

		let results = query === '' ? ItemDataList : fuse.search(query).map((r) => r.item);

		results = results.filter((item) => {
			if (item.type === 'weapon') return filters.showWeapon;
			if (item.type === 'chamberChisel') return filters.showChamberChisel;
			if (item.type === 'scroll' || item.type === 'oil') return filters.showEnchantment;
			if (['muzzle', 'scope', 'laserSight', 'chamber', 'insurance'].includes(item.type)) {
				return filters.showAttachment;
			}
			return true;
		});

		if (query === '' && sortBy !== 'default') {
			results.sort((a, b) => {
				const rarityDecrease = b.itemQuality - a.itemQuality;
				const nameDecrease = a.displayName.localeCompare(b.displayName);
				if (sortBy === 'rarityDecrease') return rarityDecrease || nameDecrease;
				if (sortBy === 'rarityIncrease') return -rarityDecrease || -nameDecrease;
				if (sortBy === 'nameDecrease') return nameDecrease || rarityDecrease;
				if (sortBy === 'nameIncrease') return -nameDecrease || -rarityDecrease;
				return 0;
			});
		}
		return results;
	});

	// Error sonner for enchantment check
	$effect(() => {
		if (invalidEnchantment) {
			toast.error('Failed to add an enchantment', {
				description: 'The weapon cannot hold any more power!',
				onAutoClose: () => (invalidEnchantment = false),
				onDismiss: () => (invalidEnchantment = false)
			});
		}
	});

	$effect(() => {
		if (invalidChamberChisel) {
			toast.error('Failed to use a chamber chisel', {
				description: "You can't use chamber chisel on an energy weapon!",
				onAutoClose: () => (invalidChamberChisel = false),
				onDismiss: () => (invalidChamberChisel = false)
			});
		}
	});

	// Build Code Sync
	$effect(() => {
		if (isInputFocused) return;

		if (selectedItems.size > 0) {
			const newCode = encodeBuild(buildData);
			if (buildCode !== newCode) {
				buildCode = newCode;
			}
		} else if (buildCode !== '') {
			buildCode = '';
		}
	});

	// Item Interaction
	function handleItemClick(item: ItemData): void {
		undoStack.push(getSelectedItems());
		redoStack = [];

		if (selectedItems.has(item.id)) {
			selectedItems.delete(item.id);
			return;
		}

		if (item.type == 'chamberChisel' && buildData.weapon?.caliber === 'Energy Cell') {
			invalidChamberChisel = true;
			return;
		}

		if (item.type === 'oil' || item.type === 'scroll') {
			const enchantments = [...selectedItems.values()].filter(
				(i) => i.type === 'oil' || i.type === 'scroll'
			);

			if (item.type === 'scroll' && enchantments.some((i) => i.type === 'scroll')) {
				const oldScroll = enchantments.find((i) => i.type === 'scroll');
				if (oldScroll) selectedItems.delete(oldScroll.id);
			} else if (enchantments.length >= 5) {
				invalidEnchantment = true;
				return;
			}
		} else if (SINGLE_SLOT_TYPES.has(item.type)) {
			for (const [id, existing] of selectedItems) {
				if (existing.type === item.type) {
					selectedItems.delete(id);
					break;
				}
			}
		}
		selectedItems.set(item.id, item);
		activeSearch = '';
		searchQuery = '';
	}

	function toggleInsurance(): void {
		undoStack.push(getSelectedItems());
		if (buildData.attachments?.find((i) => i.type === 'insurance')) {
			selectedItems.delete(INSURANCE_ID);
		} else {
			selectedItems.set(INSURANCE_ID, getItemData(INSURANCE_ID));
		}
	}

	// Search Handlers
	let searchTimer: ReturnType<typeof setTimeout>;
	function handleSearchInput(e: Event) {
		const target = e.target as HTMLInputElement;
		searchQuery = target.value;

		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			activeSearch = searchQuery;
		}, 300);
	}

	function selectFirstResult() {
		activeSearch = searchQuery;
		if (activeSearch.length > 0 && searchResults.length > 0) {
			handleItemClick(searchResults[0]);
		}
	}

	// Build/Code Handlers
	let importTimer: ReturnType<typeof setTimeout>;
	function handleCodeInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const code = target.value.trim();

		clearTimeout(importTimer);
		importTimer = setTimeout(() => {
			try {
				const decoded = decodeBuild(code);
				if (
					!decoded.weapon &&
					decoded.enchantments?.length === 0 &&
					decoded.attachments?.length === 0
				) {
					reset();
					return;
				}
				undoStack.push(getSelectedItems());
				applyState([
					...(decoded.weapon ? [decoded.weapon] : []),
					...(decoded.chamberChisel ? [decoded.chamberChisel] : []),
					...(decoded.enchantments ?? []), // Fallback to empty array
					...(decoded.attachments ?? []) // Fallback to empty array
				]);
			} catch (err: unknown) {
				reset();
			}
		}, 300);
	}

	let copyTimeout: ReturnType<typeof setTimeout>;
	function copyToClipboard() {
		if (!buildCode) return;
		navigator.clipboard.writeText(buildCode).then(() => {
			clearTimeout(copyTimeout);
			copied = true;
			copyTimeout = setTimeout(() => (copied = false), 2000);
		});
	}

	// UI/State Utilities
	function applyState(items: ItemData[]) {
		selectedItems.clear();
		for (const item of items) {
			selectedItems.set(item.id, item);
		}
	}

	function undo() {
		if (undoStack.length === 0) return;
		redoStack.push(getSelectedItems());
		applyState(undoStack.pop()!);
	}

	function redo() {
		if (redoStack.length === 0) return;
		undoStack.push(getSelectedItems());
		applyState(redoStack.pop()!);
	}

	function reset(): void {
		if (selectedItems.size === 0) return;
		undoStack.push(getSelectedItems());
		redoStack = [];
		selectedItems.clear();
	}

	function toggleAll() {
		const target = !allSelected;
		showWeapon = showChamberChisel = showEnchantment = showAttachment = target;
	}

	type FieldKey = keyof typeof fieldMapping;
	function beautifyKeyValue(itemData: ItemData, key: FieldKey) {
		if (key == 'rpm') {
			return `${itemData[key]} ${fieldMapping[key]}`;
		} else if (key === 'damage' && Array.isArray(itemData[key])) {
			return `${fieldMapping[key]}: ${itemData[key][0]}x${itemData[key][1]}`;
		} else {
			const val = itemData[key];
			const prefix = val > 0 && !['iAmmoMax', 'Spread', 'maxDurability'].includes(key) ? '+' : '';
			return `${fieldMapping[key]}: ${prefix}${val}`;
		}
	}
</script>

{#snippet item(itemData: ItemData)}
	<Tooltip.Root>
		<Tooltip.Trigger
			class={buttonVariants({
				variant: 'outline',
				class: `h-30 w-full p-0 ${BORDER_STYLE}`
			})}
			onclick={() => handleItemClick(itemData)}
			><Item.Root class="h-full w-full border-0">
				<Item.Header class="justify-center">
					{#await import(`$lib/assets/assets/${itemData.artwork}.png`) then { default: src }}
						<img {src} alt={itemData.displayName} class="h-10 w-auto rounded-sm object-contain" />
					{/await}
				</Item.Header>
				<Item.Content class="min-w-0 items-center">
					<Item.Title class="wrap-break-words line-clamp-2 w-full text-pretty"
						>{itemData.displayName}</Item.Title
					>
				</Item.Content>
			</Item.Root></Tooltip.Trigger
		>
		<Tooltip.Content
			class="w-58 overflow-hidden rounded-lg border-2 px-0! py-0! font-medium text-wrap"
		>
			<div class="flex bg-foreground px-2">
				<span class="text-base font-black text-(--card-title)">{itemData.displayName}</span>
			</div>
			<div class="bg-background p-2 leading-6 text-(--card-text)">
				{#if itemData.type in ITEM_TYPE_MAPPING}
					<p class="mb-2">{ITEM_TYPE_MAPPING[itemData.type]}</p>
				{/if}
				<ul>
					{#each itemData.displayFields as key (key)}
						<li>{beautifyKeyValue(itemData, key)}</li>
					{/each}
					{#if itemData.flavor}
						<p class="leading-tight text-[#6a858e]">{itemData.flavor}</p>
					{/if}
				</ul>
			</div>
		</Tooltip.Content>
	</Tooltip.Root>
{/snippet}

{#snippet ActionButton(label: string, onclick: any, children: any)}
	<Tooltip.Root>
		<Tooltip.Trigger class={buttonVariants({ variant: 'outline', class: BORDER_STYLE })} {onclick}>
			{@render children?.()}
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>{label}</p>
		</Tooltip.Content>
	</Tooltip.Root>
{/snippet}

{#snippet redoIcon()}
	<Redo />
{/snippet}
{#snippet undoIcon()}
	<Undo />
{/snippet}
{#snippet resetIcon()}
	<RotateCcw />
{/snippet}
{#snippet randomIcon()}
	<Shuffle />
{/snippet}
{#snippet detailIcon()}
	<BookOpenText />
{/snippet}
{#snippet addInsuranceIcon()}
	<ShieldCheck />
{/snippet}
{#snippet removeInsuranceIcon()}
	<ShieldX />
{/snippet}

<div class="flex h-full flex-col justify-center px-10">
	<div class="flex h-full flex-row">
		<div class="m-12 mr-6 flex w-full min-w-sm flex-row justify-center gap-4 p-4">
			<!-- Left part -->
			<div class="flex w-full flex-col gap-2">
				<ScrollArea class="h-full min-h-0 w-full overflow-hidden rounded-md border-2">
					<WeaponCard {buildData} />
				</ScrollArea>
				<div class="flex items-center gap-2">
					<InputGroup.Root class={BORDER_STYLE}>
						<InputGroup.Input
							placeholder="Type a code to import"
							bind:value={buildCode}
							oninput={handleCodeInput}
							onfocus={() => (isInputFocused = true)}
							onblur={() => (isInputFocused = false)}
						/>
						<!-- value={build.weapon ? shortCode : ''} -->
						<InputGroup.Addon align="inline-end">
							<Popover.Root open={copied}>
								<Popover.Trigger>
									{#snippet child({ props })}
										<InputGroup.Button {...props} onclick={copyToClipboard}>
											{#if copied}
												<CopyCheck />
											{:else}
												<Copy />
											{/if}
										</InputGroup.Button>
									{/snippet}
								</Popover.Trigger>

								<Popover.Content class="w-auto px-3 py-1.5 text-xs font-medium">
									Copied!
								</Popover.Content>
							</Popover.Root>
						</InputGroup.Addon>
					</InputGroup.Root>
				</div>
			</div>
			<!-- Right part -->
			<div class="flex w-full flex-col gap-2">
				<ScrollArea class="h-full min-h-0 w-full rounded-md border-2">
					{#if selectedItems.size > 0}
						<Item.Group
							class="grid grid-cols-2 items-stretch gap-4 p-4 sm:grid-cols-3 md:grid-cols-3"
						>
							{#each selectedItems.entries() as [itemId, itemData] (itemId)}
								{@render item(itemData)}
							{/each}
						</Item.Group>
					{:else}
						<Empty.Root class="h-full">
							<Empty.Header>
								<Empty.Media>
									<CircleQuestionMark />
								</Empty.Media>
								<Empty.Title>No item selected</Empty.Title>
								<Empty.Description>Click one to add it!</Empty.Description>
							</Empty.Header>
						</Empty.Root>
					{/if}
				</ScrollArea>
				<div class="flex items-center gap-2">
					{@render ActionButton('Undo', undo, undoIcon)}
					{@render ActionButton('Redo', redo, redoIcon)}
					{@render ActionButton('Reset', reset, resetIcon)}
					{#if buildData.attachments?.find((i) => i.type === 'insurance')}
						{@render ActionButton('Remove insurance', toggleInsurance, removeInsuranceIcon)}
					{:else}
						{@render ActionButton('Add insurance', toggleInsurance, addInsuranceIcon)}
					{/if}
					<div class="flex gap-2 text-pretty">
						<CircleAlert />
						<p>Satiety = Tetris</p>
					</div>
					<!-- {@render ActionButton('Random', reset, randomIcon)} -->
					<!-- {@render ActionButton('View detail', reset, detailIcon)} -->
				</div>
			</div>
		</div>
		<!-- Right search area -->
		<div class="m-12 ml-6 flex w-full">
			<div class="flex min-h-0 flex-1 flex-col gap-4 rounded-md p-4">
				<div class="flex items-center gap-2">
					<InputGroup.Root class={BORDER_STYLE}>
						<InputGroup.Input
							placeholder="Search..."
							bind:value={searchQuery}
							oninput={handleSearchInput}
							onkeydown={(e) => e.key === 'Enter' && selectFirstResult()}
						/>
						<InputGroup.Addon align="inline-end">
							<InputGroup.Button onclick={selectFirstResult}>
								<Search />
							</InputGroup.Button>
						</InputGroup.Addon>
					</InputGroup.Root>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger
							class={buttonVariants({
								variant: 'outline',
								className: BORDER_STYLE
							})}
						>
							<ArrowDownNarrowWide />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class={`w-48 ${BORDER_STYLE}`}>
							<DropdownMenu.Group>
								<DropdownMenu.Label>Sort By</DropdownMenu.Label>
								<DropdownMenu.Separator class="border" />
								<DropdownMenu.RadioGroup bind:value={sortBy}>
									<DropdownMenu.RadioItem value="default">Default (Type)</DropdownMenu.RadioItem>
									<DropdownMenu.Label>Rarity</DropdownMenu.Label>
									<DropdownMenu.RadioItem value="rarityDecrease">High to low</DropdownMenu.RadioItem
									>
									<DropdownMenu.RadioItem value="rarityIncrease">Low to high</DropdownMenu.RadioItem
									>
									<DropdownMenu.Label>Name</DropdownMenu.Label>
									<DropdownMenu.RadioItem value="nameDecrease">A to Z</DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem value="nameIncrease">Z to A</DropdownMenu.RadioItem>
								</DropdownMenu.RadioGroup>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>

					<DropdownMenu.Root>
						<DropdownMenu.Trigger
							class={buttonVariants({
								variant: 'outline',
								className: BORDER_STYLE
							})}
						>
							<SlidersHorizontal />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class={`w-48 ${BORDER_STYLE}`}>
							<DropdownMenu.Group>
								<DropdownMenu.Label>Item Type</DropdownMenu.Label>
								<DropdownMenu.Separator class="border" />

								<DropdownMenu.CheckboxItem checked={allSelected} onCheckedChange={toggleAll}>
									Select All
								</DropdownMenu.CheckboxItem>

								<DropdownMenu.CheckboxItem bind:checked={showWeapon}>
									Weapon
								</DropdownMenu.CheckboxItem>

								<DropdownMenu.CheckboxItem bind:checked={showChamberChisel}>
									Chamber Chisel
								</DropdownMenu.CheckboxItem>

								<DropdownMenu.CheckboxItem bind:checked={showEnchantment}>
									Enchantment
								</DropdownMenu.CheckboxItem>

								<DropdownMenu.CheckboxItem bind:checked={showAttachment}>
									Attachment
								</DropdownMenu.CheckboxItem>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
				<ScrollArea class="flex h-full min-h-0 w-full rounded-md border-2">
					{#if searchResults.length > 0}
						<Item.Group
							class="grid grid-cols-2 items-stretch gap-4 p-4 sm:grid-cols-4 md:grid-cols-5"
						>
							{#each searchResults as itemData (itemData.id)}
								{@render item(itemData)}
							{/each}
						</Item.Group>
					{:else}
						<Empty.Root class="h-full">
							<Empty.Header>
								<Empty.Media>
									<SearchX />
								</Empty.Media>
								<Empty.Title>No item found</Empty.Title>
								<Empty.Description>I know, it's hard to remember them all.</Empty.Description>
							</Empty.Header>
						</Empty.Root>
					{/if}
				</ScrollArea>
			</div>
		</div>
	</div>
</div>
