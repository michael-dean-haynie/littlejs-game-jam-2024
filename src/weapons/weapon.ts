import { PI, Sound, SoundWave } from "littlejsengine";

export const WeaponTypeNames = [
	"animalMele",
	"bat",
	"pistol",
	"shotgun",
] as const;
export type WeaponTypeName = (typeof WeaponTypeNames)[number];

export function IsWeaponTypeName(
	value: string | null,
): value is WeaponTypeName {
	return WeaponTypeNames.includes(value as WeaponTypeName);
}

export interface WeaponType {
	name: WeaponTypeName;
	cooldown: number; // ms
	damage: number;
	range: number;
	/** angle in radians (3.14 = 180 deg) */
	spread: number;
	force: number;
	sound: SoundWave;
	soundVolume: number;
}
export type WeaponTypeMap = {
	[K in WeaponTypeName]: WeaponType;
};

export function prepSound(file: string, volume = 1) {
	const sound = new SoundWave(file, 0.15);
	// sound.setVolume(0.001); // bugged for now: https://github.com/KilledByAPixel/LittleJS/issues/127
	return sound;
}

export const WeaponTypes: WeaponTypeMap = {
	animalMele: {
		name: "animalMele",
		cooldown: 1000,
		damage: 1,
		range: 1,
		spread: PI / 2, // 90 degrees
		force: 1,
		sound: prepSound("/sounds/bat.mp3"),
		soundVolume: 1,
	},
	bat: {
		name: "bat",
		cooldown: 0,
		damage: 5,
		range: 2,
		spread: PI / 2, // 90 degrees
		force: 0.5,
		sound: prepSound("/sounds/bat.mp3"),
		soundVolume: 1,
	},
	pistol: {
		name: "pistol",
		cooldown: 0,
		damage: 5,
		range: 5,
		spread: PI / 20,
		force: 1,
		sound: prepSound("/sounds/gun.mp3"),
		soundVolume: 0.1,
	},
	shotgun: {
		name: "shotgun",
		cooldown: 1000,
		damage: 10,
		range: 3,
		spread: PI / 4,
		force: 20,
		sound: prepSound("/sounds/gun.mp3"),
		soundVolume: 0.1,
	},
} as const;
