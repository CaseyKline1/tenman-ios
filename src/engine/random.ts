export const randomBetween = (min: number, max: number): number => Math.random() * (max - min) + min;

export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randomChoice = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];

export const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
