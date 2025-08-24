import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import FastImage from 'react-native-fast-image';

import {
  ImageCacheManager,
  isValidImageUri,
  createImageSource,
  getImageConfigForUri,
  ImageConfigs,
} from '../../src/services/imageCache';

// Mock global fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('ImageCache Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the validation cache before each test
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('ImageConfigs', () => {
    it('should have correct recipe image configuration', () => {
      expect(ImageConfigs.recipeImage).toEqual({
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
        resizeMode: FastImage.resizeMode.cover,
      });
    });

    it('should have correct placeholder image configuration', () => {
      expect(ImageConfigs.placeholderImage).toEqual({
        priority: FastImage.priority.low,
        cache: FastImage.cacheControl.immutable,
        resizeMode: FastImage.resizeMode.cover,
      });
    });
  });

  describe('getImageConfigForUri', () => {
    it('should return placeholder config for picsum.photos URLs', () => {
      const uri = 'https://picsum.photos/200/300';
      const config = getImageConfigForUri(uri);
      expect(config).toEqual(ImageConfigs.placeholderImage);
    });

    it('should return recipe config for other URLs', () => {
      const uri = 'https://example.com/image.jpg';
      const config = getImageConfigForUri(uri);
      expect(config).toEqual(ImageConfigs.recipeImage);
    });

    it('should return recipe config for local file URIs', () => {
      const uri = 'file:///path/to/image.jpg';
      const config = getImageConfigForUri(uri);
      expect(config).toEqual(ImageConfigs.recipeImage);
    });
  });

  describe('createImageSource', () => {
    it('should create valid source for HTTP URL', () => {
      const uri = 'https://example.com/image.jpg';
      const source = createImageSource(uri);

      expect(source).toEqual({
        uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
        headers: { 'User-Agent': 'RecipeApp/1.0' },
      });
    });

    it('should create valid source for HTTPS URL', () => {
      const uri = 'https://example.com/image.jpg';
      const source = createImageSource(uri);

      expect(source).toEqual({
        uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
        headers: { 'User-Agent': 'RecipeApp/1.0' },
      });
    });

    it('should create valid source for local file URI without headers', () => {
      const uri = 'file:///path/to/image.jpg';
      const source = createImageSource(uri);

      expect(source).toEqual({
        uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
        headers: undefined,
      });
    });

    it('should use custom config when provided', () => {
      const uri = 'https://example.com/image.jpg';
      const customConfig = ImageConfigs.placeholderImage;
      const source = createImageSource(uri, customConfig);

      expect(source).toEqual({
        uri,
        priority: FastImage.priority.low,
        cache: FastImage.cacheControl.immutable,
        headers: { 'User-Agent': 'RecipeApp/1.0' },
      });
    });

    it('should return null for empty URI', () => {
      const source = createImageSource('');
      expect(source).toBeNull();
    });

    it('should return null for whitespace-only URI', () => {
      const source = createImageSource('   ');
      expect(source).toBeNull();
    });

    it('should return null for null URI', () => {
      const source = createImageSource(null as unknown as string);
      expect(source).toBeNull();
    });
  });

  describe('isValidImageUri', () => {
    it('should return false for empty string', async () => {
      const result = await isValidImageUri('');
      expect(result).toBe(false);
    });

    it('should return false for whitespace-only string', async () => {
      const result = await isValidImageUri('   ');
      expect(result).toBe(false);
    });

    it('should return true for valid local file URI', async () => {
      const uri = 'file:///valid/path/to/image.jpg';
      const result = await isValidImageUri(uri);
      expect(result).toBe(true);
    });

    it('should return true for valid content URI', async () => {
      const uri = 'content://media/external/images/media/123';
      const result = await isValidImageUri(uri);
      expect(result).toBe(true);
    });

    it('should return false for invalid local file URI with path traversal', async () => {
      const uri = 'file:///path/../etc/passwd';
      const result = await isValidImageUri(uri);
      expect(result).toBe(false);
    });

    it('should return false for invalid local file URI with tmp/tmp', async () => {
      const uri = 'file:///tmp/tmp/image.jpg';
      const result = await isValidImageUri(uri);
      expect(result).toBe(false);
    });

    it('should return false for invalid local file URI with undefined', async () => {
      const uri = 'file:///path/undefined/image.jpg';
      const result = await isValidImageUri(uri);
      expect(result).toBe(false);
    });

    it('should return true for trusted domain (picsum.photos) without network request', async () => {
      const uri = 'https://picsum.photos/200/300';
      const result = await isValidImageUri(uri);
      expect(result).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should validate unknown HTTP domain with HEAD request', async () => {
      const uri = 'https://unique-example-domain.com/image.jpg';
      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      const result = await isValidImageUri(uri);

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(uri, {
        method: 'HEAD',
        signal: expect.any(AbortSignal),
      });
    });

    it('should return false for failed HTTP request', async () => {
      const uri = 'https://another-unique-example.com/nonexistent.jpg';
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await isValidImageUri(uri);

      expect(result).toBe(false);
      expect(mockFetch).toHaveBeenCalledWith(uri, {
        method: 'HEAD',
        signal: expect.any(AbortSignal),
      });
    });

    it('should return false for network error', async () => {
      const uri = 'https://network-error-example.com/image.jpg';
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await isValidImageUri(uri);

      expect(result).toBe(false);
    });
  });

  describe('ImageCacheManager', () => {
    describe('preloadImages', () => {
      it('should preload valid image URIs', () => {
        const imageUris = [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
          'file:///path/to/image3.jpg',
        ];

        ImageCacheManager.preloadImages(imageUris);

        expect(FastImage.preload).toHaveBeenCalledWith([
          {
            uri: 'https://example.com/image1.jpg',
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
            headers: { 'User-Agent': 'RecipeApp/1.0' },
          },
          {
            uri: 'https://example.com/image2.jpg',
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
            headers: { 'User-Agent': 'RecipeApp/1.0' },
          },
          {
            uri: 'file:///path/to/image3.jpg',
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
            headers: undefined,
          },
        ]);
      });

      it('should handle empty array gracefully', () => {
        ImageCacheManager.preloadImages([]);
        expect(FastImage.preload).not.toHaveBeenCalled();
      });

      it('should filter out invalid URIs', () => {
        const imageUris = [
          'https://example.com/image1.jpg',
          '', // Invalid
          '   ', // Invalid
          'https://example.com/image2.jpg',
        ];

        ImageCacheManager.preloadImages(imageUris);

        expect(FastImage.preload).toHaveBeenCalledWith([
          {
            uri: 'https://example.com/image1.jpg',
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
            headers: { 'User-Agent': 'RecipeApp/1.0' },
          },
          {
            uri: 'https://example.com/image2.jpg',
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
            headers: { 'User-Agent': 'RecipeApp/1.0' },
          },
        ]);
      });

      it('should use appropriate config based on URI', () => {
        const imageUris = [
          'https://picsum.photos/200/300', // Should use placeholder config
          'https://example.com/image.jpg', // Should use recipe config
        ];

        ImageCacheManager.preloadImages(imageUris);

        expect(FastImage.preload).toHaveBeenCalledWith([
          {
            uri: 'https://picsum.photos/200/300',
            priority: FastImage.priority.low, // Placeholder config
            cache: FastImage.cacheControl.immutable,
            headers: { 'User-Agent': 'RecipeApp/1.0' },
          },
          {
            uri: 'https://example.com/image.jpg',
            priority: FastImage.priority.normal, // Recipe config
            cache: FastImage.cacheControl.immutable,
            headers: { 'User-Agent': 'RecipeApp/1.0' },
          },
        ]);
      });

      it('should not call preload if no valid images remain after filtering', () => {
        const imageUris = ['', '   '];

        ImageCacheManager.preloadImages(imageUris);

        expect(FastImage.preload).not.toHaveBeenCalled();
      });
    });
  });
});
