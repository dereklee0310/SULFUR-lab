import {
	MediaQuery,
	SvelteDate,
	SvelteMap,
	SvelteSet,
	SvelteURL,
	SvelteURLSearchParams,
	createSubscriber
} from 'svelte/reactivity';

import LZString from 'lz-string';

import ammo9mm from '$lib/assets/assets/-6788899285888482108.png';
import ammo12Ga from '$lib/assets/assets/2997276035916500212.png';
import ammo556 from '$lib/assets/assets/-2351813585136004564.png';
import ammo762 from '$lib/assets/assets/2466323148575110732.png';
import ammo50BMG from '$lib/assets/assets/1146211162379945653.png';
import ammoEnergyCell from '$lib/assets/assets/2966619056940804649.png';

import itemDataList from '$lib/assets/data.json';

export { itemDataList };

export type ItemData = {
	[key: string]: any;
};

export class Build {
	weapon?: ItemData;
	chamberChisel?: ItemData;
	enchantments: ItemData[];
	attachments: ItemData[];
	[key: string]: any;

	constructor(weapon: ItemData | undefined, chamberChisel: ItemData | undefined, enchantments: ItemData[], attachments: ItemData[]) {
		this.weapon = weapon
		this.chamberChisel = chamberChisel
		this.enchantments = enchantments
		this.attachments = attachments
	}

	getWeaponName(): string | undefined {
		if (this.weapon)
			return this.weapon.m_Name;
		return;
	}

	getWeaponType(): string | undefined {
		if (this.weapon)
			return this.weapon.Type;
		return;
	}

	getAmmoType(): string | undefined {
		if (this.chamberChisel)
			return this.chamberChisel.modifiesCaliber;
		else if (this.weapon)
			return this.weapon.AmmoType;
		return;
	}

	getDamage(): string | undefined {
		if (!this.weapon)
			return;

		const states = CALIBER_STAT_MAPPING[this.getAmmoType()!];
		var baseDamage = states[0] * this.weapon.weaponTypeMultiplier * this.weapon.damageMultiplier;
		var ammoPerShot = this.weapon.m_Name == "Weapon_Augusta" ? 3 : states[1];
		var extraAmmoPerShot = this.weapon.ammoPerShot;
		var damageMultiplier = 1.0;
		var ammoMultiplier = 1.0;

		for (const enchantment of this.enchantments) {
			if (enchantment.Damage) {
				if (Math.abs(enchantment.Damage) <= 1) {
					damageMultiplier += enchantment.Damage;
				} else {
					baseDamage += enchantment.Damage
				}
			}
			if (enchantment.ProjectileAmount) {
				ammoMultiplier += enchantment.ProjectileAmount;
			}
		}

		for (const attachment of this.attachments) {
			if (attachment.Damage) {
				if (Math.abs(attachment.Damage) <= 1) {
					damageMultiplier += attachment.Damage;
				} else {
					baseDamage += attachment.Damage
				}
			}
			// No need to check ProjectileAmount here
		}

		var damage = Math.round(baseDamage * damageMultiplier).toString();
		if (ammoPerShot * ammoMultiplier > 1)
			damage += `x${ammoPerShot * ammoMultiplier}`;
		if (extraAmmoPerShot > 1)
			damage += `x${extraAmmoPerShot}`;
		return damage;
	}

	getRPM(): string | undefined {
		if (!this.weapon)
			return;

		const baserpm = this.weapon.RPM;
		var multiplier = 1.0;

		for (const enchantment of this.enchantments) {
			if (enchantment.RPM)
				multiplier += enchantment.RPM;
		}

		return Math.round((baserpm * multiplier)).toString();
	}

	getMagSize(): string | undefined {
		return this.weapon ? this.weapon.MagSize : undefined;
	}

	getSpread(): string | undefined {
		if (!this.weapon)
			return;

		const baseSpread = this.weapon.Spread;
		var multiplier = 1.0;

		for (const enchantment of this.enchantments) {
			if (enchantment.Spread)
				multiplier += enchantment.Spread;
		}
		for (const attachment of this.attachments) {
			if (attachment.Spread)
				multiplier += attachment.Spread;
		}

		return (baseSpread * multiplier).toString();
	}

	getDurability(): string | undefined {
		if (!this.weapon)
			return;

		const baseDurability = this.weapon.Durability;
		var multiplier = 1.0;

		for (const enchantment of this.enchantments) {
			if (enchantment.MaxDurability)
				multiplier += enchantment.MaxDurability;
		}

		var durability = Math.round(baseDurability * multiplier).toString();
		return `(${durability}/${durability})`
	}
};

export const WEAPON_COLUMNS: Record<string, string> = {
	type: 'Type',
	caliber: 'Ammo Type',
	// "damage": "Damage",
	rpm: 'RPM',
	iAmmoMax: 'Mag size',
	spread: 'Spread',
	maxDurability: ''
};

export const AMMO_IMGS: Record<string, string> = {
	// # 0 for Melee
	'9mm': ammo9mm, // 1
	'12Ga': ammo12Ga, // 2
	'556': ammo556, // 3
	'762': ammo762, // 4
	'50BMG': ammo50BMG, // 5
	'EnergyCell': ammoEnergyCell // 7
};

export const CALIBER_STAT_MAPPING: Record<string, number[]> = {
	'9mm': [60, 1],
	'12Ga': [20, 8],
	'556': [80, 1],
	'762': [100, 1],
	'50BMG': [200, 1],
	'EnergyCell': [50, 1],
};

export const WEAPON_TYPE_MULTIPLIERS: Record<string, number> = {
	"AssaultRifle": 1.2,
	"LMG": 1.0,
	"Pistol": 1.0,
	"Revolver": 1.6,
	"Rifle": 2.0,
	"Shotgun": 1.0,
	"SMG": 1.0,
	"Sniper": 2.0
};

type SimpleBuild = {
	w: string;
	c: string;
	e: string[];
	a: string[];
};


const id2Data = new SvelteMap<string, ItemData>(itemDataList.map((item) => [item.id, item]));

export function getItemData(id: string): ItemData {
	return id2Data.get(id)!;
}

export const decodeBuild = (buildCode: string): Build => {
	const json = LZString.decompressFromBase64(buildCode.split('').reverse().join(''));
	const simpleBuildData: SimpleBuild = JSON.parse(json).d;

	return new Build(getItemData(simpleBuildData.w), getItemData(simpleBuildData.c),
		simpleBuildData.e.map((id) => getItemData(id)).filter((i): i is ItemData => i !== undefined),
		simpleBuildData.a.map((id) => getItemData(id)).filter((i): i is ItemData => i !== undefined)
	);
};

export const encodeBuild = (buildData: Build): string => {
	return LZString.compressToBase64(
		JSON.stringify({
			v: 1,
			d: {
				w: buildData.weapon?.id,
				c: buildData.chamberChisel?.id,
				e: buildData.enchantments?.map((i) => i.id),
				a: buildData.attachments?.map((i) => i.id)
			}
		})
	)
		.split('')
		.reverse()
		.join('');
};