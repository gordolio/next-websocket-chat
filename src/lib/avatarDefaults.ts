import type { AvatarConfig } from "./types";

export const HAIR_OPTIONS = [
  "none", "long", "bun", "short", "pixie", "balding", "buzz", "afro", "bob", "mohawk",
] as const;

export const HAIR_COLOR_OPTIONS = [
  "blonde", "brown", "black", "white", "silver", "red", "orange", "blue", "pink", "purple",
  "lightRed", "lightOrange", "lightGreen", "lightBlue", "lightPink", "lightPurple",
  "green", "turqoise", "lightTurqoise",
] as const;

export const EYE_OPTIONS = [
  "normal", "leftTwitch", "happy", "content", "squint", "simple", "dizzy", "wink",
  "heart", "crazy", "cute", "cyborg", "dollars", "stars", "simplePatch", "piratePatch",
] as const;

export const EYEBROW_OPTIONS = [
  "raised", "leftLowered", "serious", "angry", "concerned", "none",
] as const;

export const MOUTH_OPTIONS = [
  "grin", "sad", "openSmile", "lips", "open", "serious", "tongue",
  "piercedTongue", "vomitingRainbow",
] as const;

export const FACIAL_HAIR_OPTIONS = [
  "none", "stubble", "mediumBeard", "goatee",
] as const;

export const CLOTHING_OPTIONS = [
  "naked", "shirt", "dressShirt", "vneck", "tankTop", "dress",
  "denimJacket", "hoodie", "chequeredShirt", "chequeredShirtDark",
] as const;

export const CLOTHING_COLOR_OPTIONS = [
  "white", "gray", "black", "red", "orange", "yellow", "green", "blue", "pink", "purple",
  "lightRed", "lightOrange", "lightYellow", "lightGreen", "lightBlue", "lightPink", "lightPurple",
  "turqoise", "lightTurqoise",
] as const;

export const ACCESSORY_OPTIONS = [
  "none", "roundGlasses", "tinyGlasses", "shades", "hoopEarrings",
] as const;

export const GRAPHIC_OPTIONS = [
  "none", "redwood", "gatsby", "vue", "react", "graphQL", "donut", "rainbow",
] as const;

export const SKIN_TONE_OPTIONS = [
  "light", "yellow", "brown", "dark", "red", "black",
] as const;

export const BODY_OPTIONS = ["chest", "breasts"] as const;

export const HAT_OPTIONS = ["none", "beanie", "turban", "party", "hijab"] as const;

export const HAT_COLOR_OPTIONS = [
  "white", "gray", "black", "red", "orange", "yellow", "green", "blue", "pink", "purple",
  "lightRed", "lightOrange", "lightYellow", "lightGreen", "lightBlue", "lightPink", "lightPurple",
  "turqoise", "lightTurqoise",
] as const;

export const LIP_COLOR_OPTIONS = [
  "red", "pink", "purple", "blue", "green", "turqoise",
  "lightRed", "lightPink", "lightPurple", "lightBlue", "lightGreen", "lightTurqoise",
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
  return arr[(hash + offset * 7) % arr.length]!;
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
    graphic: pick(GRAPHIC_OPTIONS, h, 9),
    skinTone: pick(SKIN_TONE_OPTIONS, h, 10),
    body: pick(BODY_OPTIONS, h, 11),
    hat: pick(HAT_OPTIONS, h, 12),
    hatColor: pick(HAT_COLOR_OPTIONS, h, 13),
    lipColor: pick(LIP_COLOR_OPTIONS, h, 14),
    lashes: h % 2 === 0,
    faceMask: false,
  };
}

export function generateDefaultColor(username: string): string {
  const hue = hashString(username) % 360;
  return `hsl(${hue}, 70%, 72%)`;
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function randomizeAvatar(): AvatarConfig {
  return {
    hair: pickRandom(HAIR_OPTIONS),
    hairColor: pickRandom(HAIR_COLOR_OPTIONS),
    eyes: pickRandom(EYE_OPTIONS),
    eyebrows: pickRandom(EYEBROW_OPTIONS),
    mouth: pickRandom(MOUTH_OPTIONS),
    facialHair: pickRandom(FACIAL_HAIR_OPTIONS),
    clothing: pickRandom(CLOTHING_OPTIONS),
    clothingColor: pickRandom(CLOTHING_COLOR_OPTIONS),
    accessory: pickRandom(ACCESSORY_OPTIONS),
    graphic: pickRandom(GRAPHIC_OPTIONS),
    skinTone: pickRandom(SKIN_TONE_OPTIONS),
    body: pickRandom(BODY_OPTIONS),
    hat: pickRandom(HAT_OPTIONS),
    hatColor: pickRandom(HAT_COLOR_OPTIONS),
    lipColor: pickRandom(LIP_COLOR_OPTIONS),
    lashes: Math.random() > 0.5,
    faceMask: false,
  };
}
