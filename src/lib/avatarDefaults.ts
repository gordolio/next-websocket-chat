import type { AvatarConfig } from "./types";

export const HAIR_OPTIONS = [
  "afro", "balding", "bob", "bun", "buzz", "long", "pixie", "short", "none",
] as const;

export const HAIR_COLOR_OPTIONS = [
  "blonde", "orange", "black", "white", "brown", "blue", "pink",
] as const;

export const EYE_OPTIONS = [
  "normal", "content", "dizzy", "happy", "heart", "squint", "simple", "wink",
] as const;

export const EYEBROW_OPTIONS = [
  "angry", "concerned", "leftLowered", "raised", "serious",
] as const;

export const MOUTH_OPTIONS = [
  "grin", "lips", "open", "openSmile", "sad", "serious", "tongue",
] as const;

export const FACIAL_HAIR_OPTIONS = [
  "none", "stubble", "mediumBeard",
] as const;

export const CLOTHING_OPTIONS = [
  "naked", "shirt", "dressShirt", "vneck", "tankTop", "dress",
] as const;

export const CLOTHING_COLOR_OPTIONS = [
  "white", "blue", "black", "green", "red",
] as const;

export const ACCESSORY_OPTIONS = [
  "none", "roundGlasses", "tinyGlasses", "shades",
] as const;

export const SKIN_TONE_OPTIONS = [
  "light", "yellow", "brown", "dark", "red", "black",
] as const;

export const BODY_OPTIONS = ["chest", "breasts"] as const;

export const HAT_OPTIONS = ["none", "beanie", "turban"] as const;

export const HAT_COLOR_OPTIONS = [
  "white", "blue", "black", "green", "red",
] as const;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function pick<T>(arr: readonly T[], hash: number, offset: number): T {
  return arr[(hash + offset * 7) % arr.length];
}

export function generateDefaultAvatar(username: string): AvatarConfig {
  const h = hashString(username);
  return {
    hair: pick(HAIR_OPTIONS, h, 0),
    hairColor: pick(HAIR_COLOR_OPTIONS, h, 1),
    eyes: pick(EYE_OPTIONS, h, 2),
    eyebrows: pick(EYEBROW_OPTIONS, h, 3),
    mouth: pick(MOUTH_OPTIONS, h, 4),
    facialHair: pick(FACIAL_HAIR_OPTIONS, h, 5),
    clothing: pick(CLOTHING_OPTIONS, h, 6),
    clothingColor: pick(CLOTHING_COLOR_OPTIONS, h, 7),
    accessory: pick(ACCESSORY_OPTIONS, h, 8),
    skinTone: pick(SKIN_TONE_OPTIONS, h, 9),
    body: pick(BODY_OPTIONS, h, 10),
    hat: pick(HAT_OPTIONS, h, 11),
    hatColor: pick(HAT_COLOR_OPTIONS, h, 12),
    lashes: h % 2 === 0,
  };
}

export function generateDefaultColor(username: string): string {
  const hue = hashString(username) % 360;
  return `hsl(${hue}, 70%, 72%)`;
}
