/**
 * Utility functions for working with Picsum Lorem Ipsum images
 * Provides consistent and cacheable random image generation
 */

import { DEFAULT_IMAGE_SIZE, MIN_BLUR, MAX_BLUR } from '../constants';

export interface PicsumImageOptions {
  width?: number;
  height?: number;
  seed?: string;
  grayscale?: boolean;
  blur?: number; // 1-10
}

// Constants
const PICSUM_BASE_URL = 'https://picsum.photos';
const PRESET_SEEDS = [
  'food-1',
  'food-2',
  'food-3',
  'food-4',
  'food-5',
  'recipe-1',
  'recipe-2',
  'recipe-3',
  'recipe-4',
  'recipe-5',
  'cooking-1',
  'cooking-2',
  'cooking-3',
  'cooking-4',
  'cooking-5',
] as const;

export const PicsumUtils = {
  /**
   * Generate a seeded Picsum URL that will always return the same image
   */
  generateSeededUrl: (options: PicsumImageOptions = {}): string => {
    const {
      width = DEFAULT_IMAGE_SIZE,
      height = DEFAULT_IMAGE_SIZE,
      seed = `recipe-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      grayscale = false,
      blur,
    } = options;

    let url = `${PICSUM_BASE_URL}/seed/${seed}/${width}/${height}`;
    const params: string[] = [];

    if (grayscale) {
      params.push('grayscale');
    }

    if (blur && blur >= MIN_BLUR && blur <= MAX_BLUR) {
      params.push(`blur=${Math.floor(blur)}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return url;
  },

  /**
   * Extract seed from a Picsum URL
   */
  extractSeedFromUrl: (url: string): string | null => {
    const seedMatch = url.match(/\/seed\/([^/]+)\//);
    return seedMatch?.[1] ?? null;
  },

  /**
   * Check if a URL is a seeded Picsum URL
   */
  isSeededPicsumUrl: (url: string): boolean => {
    return url.includes(`${PICSUM_BASE_URL}/seed/`);
  },

  /**
   * Check if a URL is any Picsum URL
   */
  isPicsumUrl: (url: string): boolean => {
    return url.includes(PICSUM_BASE_URL);
  },

  /**
   * Convert a random Picsum URL to a seeded one for consistency
   */
  convertRandomToSeeded: (url: string): string => {
    if (PicsumUtils.isSeededPicsumUrl(url)) {
      return url;
    }

    // Extract dimensions
    const dimensionMatch = url.match(/picsum\.photos\/(\d+)\/(\d+)/);
    const width = dimensionMatch
      ? parseInt(dimensionMatch[1], 10)
      : DEFAULT_IMAGE_SIZE;
    const height = dimensionMatch
      ? parseInt(dimensionMatch[2], 10)
      : DEFAULT_IMAGE_SIZE;

    // Generate a deterministic seed using a safer hash
    const urlHash = Array.from(url).reduce((hash, char) => {
      return (hash * 31 + char.charCodeAt(0)) % Number.MAX_SAFE_INTEGER;
    }, 0);

    return PicsumUtils.generateSeededUrl({
      width,
      height,
      seed: `converted-${Math.abs(urlHash)}`,
    });
  },

  /**
   * Generate a preset image with consistent seed
   */
  getPresetImage: (
    presetNumber: number,
    options: Omit<PicsumImageOptions, 'seed'> = {},
  ): string => {
    const seed = PRESET_SEEDS[Math.abs(presetNumber) % PRESET_SEEDS.length];
    return PicsumUtils.generateSeededUrl({ ...options, seed });
  },

  /**
   * Get image info from a Picsum URL
   */
  getImageInfo: (
    url: string,
  ): {
    width: number;
    height: number;
    seed: string | null;
    isSeeded: boolean;
    isPicsum: boolean;
  } => {
    const isPicsum = PicsumUtils.isPicsumUrl(url);
    const isSeeded = PicsumUtils.isSeededPicsumUrl(url);
    const seed = PicsumUtils.extractSeedFromUrl(url);

    const dimensionMatch = url.match(/(\d+)\/(\d+)/);
    const width = dimensionMatch ? parseInt(dimensionMatch[1], 10) : 0;
    const height = dimensionMatch ? parseInt(dimensionMatch[2], 10) : 0;

    return { width, height, seed, isSeeded, isPicsum };
  },
} as const;

export default PicsumUtils;
