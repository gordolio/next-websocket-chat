import { bigHeadOptions } from "./bigheadOptions";
import type { AvatarConfig } from "./types";

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

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function generateDefaultAvatar(username: string): AvatarConfig {
  const h = hashString(username);
  return {
    hair: pick(bigHeadOptions.hair, h, 0),
    hairColor: pick(bigHeadOptions.hairColor, h, 1),
    eyes: pick(bigHeadOptions.eyes, h, 2),
    eyebrows: pick(bigHeadOptions.eyebrows, h, 3),
    mouth: pick(bigHeadOptions.mouth, h, 4),
    facialHair: pick(bigHeadOptions.facialHair, h, 5),
    clothing: pick(bigHeadOptions.clothing, h, 6),
    clothingColor: pick(bigHeadOptions.clothingColor, h, 7),
    accessory: pick(bigHeadOptions.accessory, h, 8),
    graphic: pick(bigHeadOptions.graphic, h, 9),
    skinTone: pick(bigHeadOptions.skinTone, h, 10),
    body: pick(bigHeadOptions.body, h, 11),
    hat: pick(bigHeadOptions.hat, h, 12),
    hatColor: pick(bigHeadOptions.hatColor, h, 13),
    lipColor: pick(bigHeadOptions.lipColor, h, 14),
    facialHairColor: pick(bigHeadOptions.facialHairColor, h, 15),
    backgroundColor: pick(bigHeadOptions.backgroundColor, h, 16),
    backgroundShape: pick(bigHeadOptions.backgroundShape, h, 17),
    faceMaskColor: pick(bigHeadOptions.faceMaskColor, h, 18),
    showBackground: false,
    lashes: h % 2 === 0,
    faceMask: false,
  } satisfies AvatarConfig;
}

export function generateDefaultColor(username: string): string {
  const hue = hashString(username) % 360;
  return `hsl(${hue}, 70%, 72%)`;
}

export function randomizeAvatar(): AvatarConfig {
  return {
    hair: pickRandom(bigHeadOptions.hair),
    hairColor: pickRandom(bigHeadOptions.hairColor),
    eyes: pickRandom(bigHeadOptions.eyes),
    eyebrows: pickRandom(bigHeadOptions.eyebrows),
    mouth: pickRandom(bigHeadOptions.mouth),
    facialHair: pickRandom(bigHeadOptions.facialHair),
    clothing: pickRandom(bigHeadOptions.clothing),
    clothingColor: pickRandom(bigHeadOptions.clothingColor),
    accessory: pickRandom(bigHeadOptions.accessory),
    graphic: pickRandom(bigHeadOptions.graphic),
    skinTone: pickRandom(bigHeadOptions.skinTone),
    body: pickRandom(bigHeadOptions.body),
    hat: pickRandom(bigHeadOptions.hat),
    hatColor: pickRandom(bigHeadOptions.hatColor),
    lipColor: pickRandom(bigHeadOptions.lipColor),
    facialHairColor: pickRandom(bigHeadOptions.facialHairColor),
    backgroundColor: pickRandom(bigHeadOptions.backgroundColor),
    backgroundShape: pickRandom(bigHeadOptions.backgroundShape),
    faceMaskColor: pickRandom(bigHeadOptions.faceMaskColor),
    showBackground: false,
    lashes: Math.random() > 0.5,
    faceMask: false,
  } satisfies AvatarConfig;
}
