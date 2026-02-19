<script lang="ts">
	import '$lib/i18n';
	import { _ } from 'svelte-i18n';
	import { AMMO_IMGS } from '$lib/components/sulfur-lab/utils';
	import { type ItemData, Build } from '$lib/components/sulfur-lab/utils';

	let { buildData }: { buildData: Build } = $props();

	const Label = {
		Rank: $_('ItemDescriptions/Label_Rank'),
		Type: $_('ItemDescriptions/Label_Type'),
		AmmoType: $_('ItemDescriptions/Label_AmmoType'),
		Damage: $_('ItemDescriptions/Label_Damage'),
		RPM: $_('ItemDescriptions/Label_RPM'),
		MagSize: $_('ItemDescriptions/Label_MagSize'),
		Spread: $_('ItemDescriptions/Label_Spread'),
		Condition: $_('ItemDescriptions/ItemDurability_PerfectCondition'),
		Enchantments: $_('ItemDescriptions/Label_Enchantments'),
		Attachments: $_('ItemDescriptions/Label_Attachments')
	} as const;

	const fb = { default: '???' };
	const weaponName = $derived($_(`Items/${buildData.getWeaponName()}`, fb));
	const weaponType = $derived($_(`ItemDescriptions/WeaponType_${buildData.getWeaponType()}`, fb));
	const ammoType = $derived($_(`WorldResource/Resource_Ammo_${buildData.getAmmoType()}_short`, fb));
	const weaponFlavor = $derived($_(`Items/${buildData.getWeaponName()}_flavor`, fb));
</script>

<div class="text flex h-full flex-col rounded-md bg-background select-none">
	<header class="flex items-center justify-between bg-foreground px-2 py-1.5 text-(--card-title)">
		<span class="text-lg font-black">{weaponName}</span>
		<div class="flex flex-col items-end">
			<span class="leading-none font-black">{Label.Rank} 5</span>
			<div class="mt-0.5 h-2 w-10.5 rounded-full bg-(--card-title)"></div>
		</div>
	</header>

	<div class="space-y-2 p-2 text-xs font-medium text-(--card-text)">
		<p>{Label.Type}: {weaponType}</p>

		<div class="flex items-center justify-between">
			<p>{Label.AmmoType}: {ammoType}</p>
			{#if buildData.weapon || buildData.chamberChisel}
				<img src={AMMO_IMGS[buildData.getAmmoType()!]} class="h-4" alt="ammo" />
			{/if}
		</div>

		<p>{Label.Damage}: {buildData.getDamage()}</p>
		<p>{buildData.getRPM()} {Label.RPM}</p>
		<p>{Label.MagSize}: {buildData.getMagSize()}</p>
		<p>{Label.Spread}: {buildData.getSpread()}</p>
		<p>{Label.Condition} {buildData.getDurability()}</p>
		<p class="text-[#6a858e]">{weaponFlavor}</p>
	</div>

	{#snippet listSection(title: string, items: ItemData[])}
		<div>
			<div class="inline-block rounded-tr-lg bg-foreground px-1">
				<span class="text-sm font-black text-(--card-title)">{title}</span>
			</div>
			<div class="space-y-1 border-t border-foreground p-2 text-xs font-medium">
				{#each items as item}
					<p
						class:invisible={!item}
						class="text-(--card-text)"
						class:text-[#fab140]!={item?.type === 'scroll'}
					>
						{$_(`Items/${item.m_Name}`)}
					</p>
				{/each}
			</div>
		</div>
	{/snippet}

	{@render listSection(Label.Enchantments, buildData.enchantments)}
	{@render listSection(Label.Attachments, buildData.attachments)}
</div>
