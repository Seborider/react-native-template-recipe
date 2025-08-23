import { getRecipes, updateRecipe } from './storage';
import { ImageCacheManager } from './imageCache';
import { PicsumUtils } from '../utils/picsumUtils';

type CleanupResult = {
  recipesUpdated: number;
  imagesRemoved: number;
};

type ValidationReport = {
  totalRecipes: number;
  totalImages: number;
  validImages: number;
  invalidImages: number;
  recipesWithIssues: string[];
};

type MigrationResult = {
  recipesUpdated: number;
  urlsConverted: number;
};

export const ImageMaintenanceService = {
  cleanupInvalidImages: async (): Promise<CleanupResult> => {
    try {
      const recipes = await getRecipes();

      // Process all recipes in parallel
      const updatePromises = recipes.map(async recipe => {
        if (!recipe.images?.length) {
          return { updated: false, removed: 0 };
        }

        const validImages = await ImageCacheManager.filterValidImageUris(
          recipe.images,
        );
        const imagesRemoved = recipe.images.length - validImages.length;

        if (imagesRemoved > 0) {
          console.log(
            `Recipe "${recipe.title}": Removing ${imagesRemoved} invalid image(s)`,
          );

          await updateRecipe({
            ...recipe,
            images: validImages,
            updatedAt: new Date(),
          });

          return { updated: true, removed: imagesRemoved };
        }

        return { updated: false, removed: 0 };
      });

      const results = await Promise.all(updatePromises);

      const recipesUpdated = results.filter(r => r.updated).length;
      const totalImagesRemoved = results.reduce((sum, r) => sum + r.removed, 0);

      console.log(
        `Image cleanup: ${recipesUpdated} recipes updated, ${totalImagesRemoved} images removed`,
      );

      return { recipesUpdated, imagesRemoved: totalImagesRemoved };
    } catch (error) {
      console.error('Failed to cleanup invalid images:', error);
      throw error;
    }
  },

  validateImageHealth: async (): Promise<ValidationReport> => {
    try {
      const recipes = await getRecipes();

      // Parallel validation of all recipes
      const validationPromises = recipes.map(async recipe => {
        if (!recipe.images?.length) {
          return { total: 0, valid: 0, invalid: 0, title: recipe.title };
        }

        const validUris = await ImageCacheManager.filterValidImageUris(
          recipe.images,
        );
        const total = recipe.images.length;
        const valid = validUris.length;
        const invalid = total - valid;

        return { total, valid, invalid, title: recipe.title };
      });

      const results = await Promise.all(validationPromises);

      const totalImages = results.reduce((sum, r) => sum + r.total, 0);
      const validImages = results.reduce((sum, r) => sum + r.valid, 0);
      const invalidImages = results.reduce((sum, r) => sum + r.invalid, 0);
      const recipesWithIssues = results
        .filter(r => r.invalid > 0)
        .map(r => `${r.title} (${r.invalid} invalid)`);

      const report: ValidationReport = {
        totalRecipes: recipes.length,
        totalImages,
        validImages,
        invalidImages,
        recipesWithIssues,
      };

      console.log('Image Health Report:', report);
      return report;
    } catch (error) {
      console.error('Failed to validate image health:', error);
      throw error;
    }
  },

  preloadAllRecipeImages: async (): Promise<void> => {
    try {
      const recipes = await getRecipes();
      const allImageUris = recipes.flatMap(recipe => recipe.images || []);

      if (allImageUris.length > 0) {
        await ImageCacheManager.preloadValidImages(allImageUris);
        console.log(`Preloaded images from ${recipes.length} recipes`);
      }
    } catch (error) {
      console.error('Failed to preload recipe images:', error);
    }
  },

  refreshImageCache: async (): Promise<void> => {
    try {
      await ImageCacheManager.clearCache();
      await ImageMaintenanceService.preloadAllRecipeImages();
      console.log('Image cache refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh image cache:', error);
      throw error;
    }
  },

  migratePicsumUrls: async (): Promise<MigrationResult> => {
    try {
      const recipes = await getRecipes();

      const migrationPromises = recipes.map(async recipe => {
        if (!recipe.images?.length) {
          return { updated: false, converted: 0 };
        }

        let conversions = 0;
        const updatedImages = recipe.images.map(uri => {
          if (
            PicsumUtils.isPicsumUrl(uri) &&
            !PicsumUtils.isSeededPicsumUrl(uri)
          ) {
            console.log(`Converting Picsum URL: ${uri}`);
            conversions++;
            return PicsumUtils.convertRandomToSeeded(uri);
          }
          return uri;
        });

        if (conversions > 0) {
          await updateRecipe({
            ...recipe,
            images: updatedImages,
            updatedAt: new Date(),
          });
          return { updated: true, converted: conversions };
        }

        return { updated: false, converted: 0 };
      });

      const results = await Promise.all(migrationPromises);

      const recipesUpdated = results.filter(r => r.updated).length;
      const totalUrlsConverted = results.reduce(
        (sum, r) => sum + r.converted,
        0,
      );

      console.log(
        `Picsum migration: ${recipesUpdated} recipes updated, ${totalUrlsConverted} URLs converted`,
      );

      return { recipesUpdated, urlsConverted: totalUrlsConverted };
    } catch (error) {
      console.error('Failed to migrate Picsum URLs:', error);
      throw error;
    }
  },
} as const;
