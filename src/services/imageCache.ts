import FastImage, { Source } from 'react-native-fast-image';
import { VALIDATION_CACHE_TTL, IMAGE_LOAD_TIMEOUT } from '../constants';

// Type definitions
type ImagePriority =
  (typeof FastImage.priority)[keyof typeof FastImage.priority];
type ImageCache =
  (typeof FastImage.cacheControl)[keyof typeof FastImage.cacheControl];
type ImageResizeMode =
  (typeof FastImage.resizeMode)[keyof typeof FastImage.resizeMode];

interface ImageConfig {
  priority: ImagePriority;
  cache: ImageCache;
  resizeMode: ImageResizeMode;
}

// Configuration
export const ImageCacheConfig = {
  priority: FastImage.priority,
  cacheControl: FastImage.cacheControl,
  resizeMode: FastImage.resizeMode,
} as const;

// Predefined configurations
export const ImageConfigs: Record<string, ImageConfig> = {
  recipeImage: {
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable,
    resizeMode: FastImage.resizeMode.cover,
  },
  placeholderImage: {
    priority: FastImage.priority.low,
    cache: FastImage.cacheControl.immutable,
    resizeMode: FastImage.resizeMode.cover,
  },
  thumbnail: {
    priority: FastImage.priority.high,
    cache: FastImage.cacheControl.immutable,
    resizeMode: FastImage.resizeMode.cover,
  },
} as const;

// Validation cache to avoid repeated checks
const validationCache = new Map<
  string,
  { isValid: boolean; timestamp: number }
>();

// Cache management utilities
export const ImageCacheManager = {
  clearCache: async (): Promise<void> => {
    try {
      await Promise.all([
        FastImage.clearMemoryCache(),
        FastImage.clearDiskCache(),
      ]);
      validationCache.clear();
      console.log('Image cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear image cache:', error);
    }
  },

  clearMemoryCache: async (): Promise<void> => {
    try {
      await FastImage.clearMemoryCache();
      console.log('Memory cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear memory cache:', error);
    }
  },

  clearDiskCache: async (): Promise<void> => {
    try {
      await FastImage.clearDiskCache();
      console.log('Disk cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear disk cache:', error);
    }
  },

  preloadImages: (imageUris: string[]): void => {
    if (imageUris.length === 0) {
      return;
    }

    const imageSources = imageUris
      .map(uri => createImageSource(uri, getImageConfigForUri(uri)))
      .filter((source): source is Source => source !== null);

    if (imageSources.length > 0) {
      FastImage.preload(imageSources);
      console.log(`Preloading ${imageSources.length} images`);
    }
  },

  filterValidImageUris: async (imageUris: string[]): Promise<string[]> => {
    const validationPromises = imageUris.map(async uri => ({
      uri,
      isValid: await isValidImageUri(uri),
    }));

    const results = await Promise.all(validationPromises);
    return results.filter(r => r.isValid).map(r => r.uri);
  },

  preloadValidImages: async (imageUris: string[]): Promise<void> => {
    const validUris = await ImageCacheManager.filterValidImageUris(imageUris);
    ImageCacheManager.preloadImages(validUris);
  },
} as const;

// Optimized URI validation with caching
export const isValidImageUri = async (uri: string): Promise<boolean> => {
  if (!uri || uri.trim().length === 0) {
    return false;
  }

  // Check cache first
  const cached = validationCache.get(uri);
  if (cached && Date.now() - cached.timestamp < VALIDATION_CACHE_TTL) {
    return cached.isValid;
  }

  let isValid = false;

  try {
    // Local file validation
    if (uri.startsWith('file://') || uri.startsWith('content://')) {
      // Basic validation for local URIs
      isValid =
        uri.length > 10 &&
        !uri.includes('..') &&
        !uri.includes('tmp/tmp') &&
        !uri.includes('undefined');
    }
    // Remote URL validation (skip HEAD request for known good domains)
    else if (uri.startsWith('http://') || uri.startsWith('https://')) {
      // Trust known good image domains
      const trustedDomains = ['picsum.photos', 'unsplash.com', 'pexels.com'];
      const url = new URL(uri);

      if (trustedDomains.some(domain => url.hostname.includes(domain))) {
        isValid = true;
      } else {
        // Only validate unknown domains
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          IMAGE_LOAD_TIMEOUT,
        );

        try {
          const response = await fetch(uri, {
            method: 'HEAD',
            signal: controller.signal,
          });
          isValid = response.ok;
        } finally {
          clearTimeout(timeoutId);
        }
      }
    }
  } catch (error) {
    console.warn('URI validation failed:', uri, error);
    isValid = false;
  }

  // Update cache
  validationCache.set(uri, { isValid, timestamp: Date.now() });

  // Clean old cache entries periodically
  if (validationCache.size > 100) {
    const now = Date.now();
    for (const [key, value] of validationCache.entries()) {
      if (now - value.timestamp > VALIDATION_CACHE_TTL) {
        validationCache.delete(key);
      }
    }
  }

  return isValid;
};

// Helper to create FastImage source
export const createImageSource = (
  uri: string,
  config: ImageConfig = ImageConfigs.recipeImage,
): Source | null => {
  if (!uri || uri.trim().length === 0) {
    console.warn('Invalid URI provided to createImageSource');
    return null;
  }

  return {
    uri,
    priority: config.priority,
    cache: config.cache,
    headers: uri.startsWith('http')
      ? { 'User-Agent': 'RecipeApp/1.0' }
      : undefined,
  };
};

// Determine config based on URI
export const getImageConfigForUri = (uri: string): ImageConfig => {
  if (uri.includes('picsum.photos')) {
    return ImageConfigs.placeholderImage;
  }

  if (uri.startsWith('file://') || uri.startsWith('content://')) {
    return ImageConfigs.recipeImage;
  }

  return ImageConfigs.recipeImage;
};
