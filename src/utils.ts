import { BirthdayConfig } from './types';

export function encodeConfig(config: BirthdayConfig): string {
  try {
    const json = JSON.stringify(config);
    return btoa(encodeURIComponent(json));
  } catch (e) {
    console.error('Failed to encode config', e);
    return '';
  }
}

export function decodeConfig(encoded: string | null): BirthdayConfig | null {
  if (!encoded) return null;
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to decode config', e);
    return null;
  }
}

export const PASTEL_COLORS = [
  '#FFD1DC', // Pink
  '#FFD3B6', // Peach
  '#FFF2B2', // Yellow
  '#D4EDDA', // Green
  '#B2E2F2', // Blue
];

export const DEFAULT_WISHES = ['🎂', '🎁', '🎈', '💖', '⭐', '✨', '🍭', '🥳'];
