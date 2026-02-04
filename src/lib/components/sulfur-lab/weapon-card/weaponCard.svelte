<script lang="ts">
    import {AMMO_IMGS} from '$lib/components/sulfur-lab/utils';
    import { type ItemData } from '$lib/components/sulfur-lab/utils';

    let {
        buildData,
    } = $props();

    const getSlots = (list: any) => [...(list || []), ...Array(5)].slice(0, 5);
</script>

<div class="flex h-full flex-col rounded-md bg-background text select-none">
    <header class="flex items-center justify-between bg-foreground px-2 py-1.5 text-(--card-title)">
        <span class="text-lg font-black">{buildData.getWeaponName()}</span>
        <div class="flex flex-col items-end">
            <span class="leading-none font-black">Rank 5</span>
            <div class="mt-0.5 h-2 w-10.5 rounded-full bg-(--card-title)"></div>
        </div>
    </header>

    <div class="space-y-2 p-2 text-xs font-medium text-(--card-text)">
        <p>Type: <span>{buildData.getWeaponType()}</span></p>

        <div class="flex items-center justify-between">
            <p>Ammo type: <span>{buildData.getAmmoType()}</span></p>
            {#if buildData.weapon || buildData.chamberChisel}
                <img src={AMMO_IMGS[buildData.getAmmoType()]} class="h-4" alt="ammo" />
            {/if}
        </div>

        <p>Damage: {buildData.getDamage()}</p>
        <p>{buildData.getRPM()} RPM</p>
        <p>Mag size: {buildData.getMagSize()}</p>
        <p>Spread: {buildData.getSpread()}</p>
        <p>Perfect condition {buildData.getDurability()}</p>
        <p class="text-[#6a858e]">{(buildData.weapon?.flavor)}</p>
    </div>

    {#snippet listSection(title: string, items: ItemData[])}
        <div>
            <div class="inline-block rounded-tr-lg bg-foreground px-1">
                <span class="text-sm font-black text-(--card-title)">{title}</span>
            </div>
            <div class="space-y-1 border-t border-foreground p-2 text-xs font-medium">
                {#each items as item}
                    <p class:invisible={!item} class="text-(--card-text)" class:text-[#fab140]!={item?.type === 'scroll'}>
                        {item?.displayName ?? 'none'}
                    </p>
                {/each}
            </div>
        </div>
    {/snippet}

    {@render listSection('Enchantments', buildData.enchantments)}
    {@render listSection('Attachments', buildData.attachments)}
</div>