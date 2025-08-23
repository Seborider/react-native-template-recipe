import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getRecipes,
  saveRecipe,
  updateRecipe,
  deleteRecipe,
  deleteRecipes,
  clearAllRecipes,
  getRecipeById,
  searchRecipes,
  invalidateCache,
} from '../../src/services/storage';
import { Recipe } from '../../src/types/Recipe';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const mockRecipe1: Recipe = {
  id: '1',
  title: 'Test Recipe 1',
  description: 'Description 1',
  images: ['https://example.com/image1.jpg'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockRecipe2: Recipe = {
  id: '2',
  title: 'Test Recipe 2',
  description: 'Description 2',
  images: ['https://example.com/image2.jpg', 'https://example.com/image3.jpg'],
  createdAt: new Date('2024-01-02'),
  updatedAt: new Date('2024-01-02'),
};

describe('storage functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache before each test
    invalidateCache();
  });

  describe('getRecipes', () => {
    it('returns empty array when no recipes are stored', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const recipes = await getRecipes();

      expect(recipes).toEqual([]);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@recipes');
    });

    it('returns parsed recipes with Date objects', async () => {
      const storedRecipes = [
        {
          ...mockRecipe1,
          createdAt: mockRecipe1.createdAt.toISOString(),
          updatedAt: mockRecipe1.updatedAt?.toISOString(),
        },
        {
          ...mockRecipe2,
          createdAt: mockRecipe2.createdAt.toISOString(),
          updatedAt: mockRecipe2.updatedAt?.toISOString(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedRecipes));

      const recipes = await getRecipes();

      expect(recipes).toHaveLength(2);
      expect(recipes[0]).toEqual(mockRecipe1);
      expect(recipes[1]).toEqual(mockRecipe2);
      expect(recipes[0].createdAt).toBeInstanceOf(Date);
      expect(recipes[1].createdAt).toBeInstanceOf(Date);
    });

    it('uses cache on second call', async () => {
      const storedRecipes = [
        {
          ...mockRecipe1,
          createdAt: mockRecipe1.createdAt.toISOString(),
          updatedAt: mockRecipe1.updatedAt?.toISOString(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedRecipes));

      // First call - should hit storage
      await getRecipes();
      expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      await getRecipes();
      expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(1); // Still only 1 call
    });

    it('returns empty array when JSON parsing fails', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(jest.fn());

      const recipes = await getRecipes();

      expect(recipes).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Storage read error:',
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });

    it('returns empty array when AsyncStorage throws error', async () => {
      const error = new Error('AsyncStorage error');
      mockAsyncStorage.getItem.mockRejectedValue(error);
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(jest.fn());

      const recipes = await getRecipes();

      expect(recipes).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Storage read error:', error);
      consoleSpy.mockRestore();
    });

    it('handles recipes with missing or invalid dates', async () => {
      const storedRecipes = [
        {
          ...mockRecipe1,
          createdAt: 'invalid-date',
          updatedAt: undefined,
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedRecipes));

      const recipes = await getRecipes();

      expect(recipes[0].createdAt).toBeInstanceOf(Date);
      // Should use current date as fallback for invalid date
      expect(recipes[0].createdAt.getTime()).not.toBeNaN();
    });
  });

  describe('saveRecipe', () => {
    it('saves recipe to existing list', async () => {
      const existingRecipes = [
        {
          ...mockRecipe1,
          createdAt: mockRecipe1.createdAt.toISOString(),
          updatedAt: mockRecipe1.updatedAt?.toISOString(),
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(existingRecipes),
      );
      mockAsyncStorage.setItem.mockResolvedValue();

      await saveRecipe(mockRecipe2);

      const savedCall = mockAsyncStorage.setItem.mock.calls[0];
      const savedData = JSON.parse(savedCall[1] as string);

      expect(savedCall[0]).toBe('@recipes');
      expect(savedData).toHaveLength(2);
      expect(savedData[0].id).toBe(mockRecipe1.id);
      expect(savedData[1].id).toBe(mockRecipe2.id);
    });

    it('saves recipe to empty list', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue();

      await saveRecipe(mockRecipe1);

      const savedCall = mockAsyncStorage.setItem.mock.calls[0];
      const savedData = JSON.parse(savedCall[1] as string);

      expect(savedCall[0]).toBe('@recipes');
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe(mockRecipe1.id);
    });

    it('throws error when recipe has no ID', async () => {
      const recipeWithoutId = { ...mockRecipe1, id: '' };

      await expect(saveRecipe(recipeWithoutId)).rejects.toThrow(
        '[Storage:save] Recipe must have an ID',
      );
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('throws error when recipe with same ID already exists', async () => {
      const existingRecipes = [
        {
          ...mockRecipe1,
          createdAt: mockRecipe1.createdAt.toISOString(),
          updatedAt: mockRecipe1.updatedAt?.toISOString(),
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(existingRecipes),
      );

      await expect(saveRecipe(mockRecipe1)).rejects.toThrow(
        `[Storage:save] Recipe ${mockRecipe1.id} already exists`,
      );
    });

    it('adds createdAt and updatedAt timestamps if missing', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue();

      const recipeWithoutDates = {
        id: '3',
        title: 'No dates',
        description: 'Test',
        images: [],
      } as unknown as Recipe;

      await saveRecipe(recipeWithoutDates);

      const savedCall = mockAsyncStorage.setItem.mock.calls[0];
      const savedData = JSON.parse(savedCall[1] as string);

      expect(savedData[0].createdAt).toBeDefined();
      expect(savedData[0].updatedAt).toBeDefined();
    });
  });

  describe('updateRecipe', () => {
    it('updates existing recipe', async () => {
      const existingRecipes = [
        {
          ...mockRecipe1,
          createdAt: mockRecipe1.createdAt.toISOString(),
          updatedAt: mockRecipe1.updatedAt?.toISOString(),
        },
        {
          ...mockRecipe2,
          createdAt: mockRecipe2.createdAt.toISOString(),
          updatedAt: mockRecipe2.updatedAt?.toISOString(),
        },
      ];
      const updatedRecipe1 = { ...mockRecipe1, title: 'Updated Title' };

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(existingRecipes),
      );
      mockAsyncStorage.setItem.mockResolvedValue();

      await updateRecipe(updatedRecipe1);

      const savedCall = mockAsyncStorage.setItem.mock.calls[0];
      const savedData = JSON.parse(savedCall[1] as string);

      expect(savedData[0].title).toBe('Updated Title');
      expect(savedData[0].createdAt).toBe(mockRecipe1.createdAt.toISOString());
      expect(savedData[1].id).toBe(mockRecipe2.id);
    });

    it('throws error when recipe does not exist', async () => {
      const existingRecipes = [
        {
          ...mockRecipe2,
          createdAt: mockRecipe2.createdAt.toISOString(),
          updatedAt: mockRecipe2.updatedAt?.toISOString(),
        },
      ];
      const nonExistentRecipe = { ...mockRecipe1, id: 'non-existent' };

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(existingRecipes),
      );

      await expect(updateRecipe(nonExistentRecipe)).rejects.toThrow(
        '[Storage:update] Recipe non-existent not found',
      );
    });

    it('throws error when recipe has no ID', async () => {
      const recipeWithoutId = { ...mockRecipe1, id: '' };

      await expect(updateRecipe(recipeWithoutId)).rejects.toThrow(
        '[Storage:update] Recipe must have an ID',
      );
    });

    it('preserves original createdAt and updates updatedAt', async () => {
      const originalCreatedAt = mockRecipe1.createdAt.toISOString();
      const existingRecipes = [
        {
          ...mockRecipe1,
          createdAt: originalCreatedAt,
          updatedAt: mockRecipe1.updatedAt?.toISOString(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(existingRecipes),
      );
      mockAsyncStorage.setItem.mockResolvedValue();

      const updatedRecipe = {
        ...mockRecipe1,
        title: 'Updated',
        createdAt: new Date('2025-01-01'), // Try to change createdAt
      };

      await updateRecipe(updatedRecipe);

      const savedCall = mockAsyncStorage.setItem.mock.calls[0];
      const savedData = JSON.parse(savedCall[1] as string);

      expect(savedData[0].createdAt).toBe(originalCreatedAt); // Should preserve original
      expect(new Date(savedData[0].updatedAt).getTime()).toBeGreaterThan(
        new Date(originalCreatedAt).getTime(),
      );
    });
  });

  describe('deleteRecipe', () => {
    it('deletes existing recipe', async () => {
      const existingRecipes = [
        {
          ...mockRecipe1,
          createdAt: mockRecipe1.createdAt.toISOString(),
          updatedAt: mockRecipe1.updatedAt?.toISOString(),
        },
        {
          ...mockRecipe2,
          createdAt: mockRecipe2.createdAt.toISOString(),
          updatedAt: mockRecipe2.updatedAt?.toISOString(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(existingRecipes),
      );
      mockAsyncStorage.setItem.mockResolvedValue();

      await deleteRecipe(mockRecipe1.id);

      const savedCall = mockAsyncStorage.setItem.mock.calls[0];
      const savedData = JSON.parse(savedCall[1] as string);

      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe(mockRecipe2.id);
    });

    it('throws error when recipe does not exist', async () => {
      const existingRecipes = [
        {
          ...mockRecipe1,
          createdAt: mockRecipe1.createdAt.toISOString(),
          updatedAt: mockRecipe1.updatedAt?.toISOString(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(existingRecipes),
      );

      await expect(deleteRecipe('non-existent-id')).rejects.toThrow(
        '[Storage:delete] Recipe non-existent-id not found',
      );
    });

    it('throws error when recipe ID is empty', async () => {
      await expect(deleteRecipe('')).rejects.toThrow(
        '[Storage:delete] Recipe ID required',
      );
    });
  });

  describe('deleteRecipes (batch)', () => {
    it('deletes multiple recipes at once', async () => {
      const existingRecipes = [
        {
          ...mockRecipe1,
          createdAt: mockRecipe1.createdAt.toISOString(),
          updatedAt: mockRecipe1.updatedAt?.toISOString(),
        },
        {
          ...mockRecipe2,
          createdAt: mockRecipe2.createdAt.toISOString(),
          updatedAt: mockRecipe2.updatedAt?.toISOString(),
        },
        {
          id: '3',
          title: 'Recipe 3',
          description: 'Test',
          images: [],
          createdAt: new Date().toISOString(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(existingRecipes),
      );
      mockAsyncStorage.setItem.mockResolvedValue();

      await deleteRecipes(['1', '3']);

      const savedCall = mockAsyncStorage.setItem.mock.calls[0];
      const savedData = JSON.parse(savedCall[1] as string);

      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe('2');
    });

    it('does nothing when array is empty', async () => {
      await deleteRecipes([]);
      expect(mockAsyncStorage.getItem).not.toHaveBeenCalled();
    });

    it('handles non-existent IDs gracefully', async () => {
      const existingRecipes = [
        {
          ...mockRecipe1,
          createdAt: mockRecipe1.createdAt.toISOString(),
          updatedAt: mockRecipe1.updatedAt?.toISOString(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(existingRecipes),
      );
      mockAsyncStorage.setItem.mockResolvedValue();

      await deleteRecipes(['1', 'non-existent']);

      const savedCall = mockAsyncStorage.setItem.mock.calls[0];
      const savedData = JSON.parse(savedCall[1] as string);

      expect(savedData).toHaveLength(0);
    });
  });

  describe('clearAllRecipes', () => {
    it('removes recipes from storage', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue();

      await clearAllRecipes();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@recipes');
    });

    it('invalidates cache after clearing', async () => {
      // Setup cached data
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([mockRecipe1]));
      await getRecipes(); // Populate cache

      // Clear all
      mockAsyncStorage.removeItem.mockResolvedValue();
      await clearAllRecipes();

      // Next getRecipes should hit storage again
      mockAsyncStorage.getItem.mockResolvedValue(null);
      await getRecipes();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('getRecipeById', () => {
    it('returns recipe when found', async () => {
      const existingRecipes = [
        {
          ...mockRecipe1,
          createdAt: mockRecipe1.createdAt.toISOString(),
          updatedAt: mockRecipe1.updatedAt?.toISOString(),
        },
        {
          ...mockRecipe2,
          createdAt: mockRecipe2.createdAt.toISOString(),
          updatedAt: mockRecipe2.updatedAt?.toISOString(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(existingRecipes),
      );

      const recipe = await getRecipeById('2');

      expect(recipe).toEqual(mockRecipe2);
    });

    it('returns null when not found', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([mockRecipe1]));

      const recipe = await getRecipeById('non-existent');

      expect(recipe).toBeNull();
    });
  });

  describe('searchRecipes', () => {
    it('filters recipes based on predicate', async () => {
      const recipes = [
        { ...mockRecipe1, title: 'Pasta Recipe' },
        { ...mockRecipe2, title: 'Salad Recipe' },
        { ...mockRecipe1, id: '3', title: 'Another Pasta' },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(
          recipes.map(r => ({
            ...r,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt?.toISOString(),
          })),
        ),
      );

      const pastaRecipes = await searchRecipes(recipe =>
        recipe.title.toLowerCase().includes('pasta'),
      );

      expect(pastaRecipes).toHaveLength(2);
      expect(pastaRecipes[0].title).toBe('Pasta Recipe');
      expect(pastaRecipes[1].title).toBe('Another Pasta');
    });

    it('returns empty array when no matches', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify([mockRecipe1, mockRecipe2]),
      );

      const results = await searchRecipes(
        recipe => recipe.title === 'Non-existent',
      );

      expect(results).toEqual([]);
    });
  });

  describe('mutex behavior', () => {
    it('processes concurrent operations sequentially', async () => {
      const callOrder: string[] = [];

      // Mock delayed responses to simulate async operations
      mockAsyncStorage.getItem.mockImplementation(() => {
        callOrder.push('read');
        return new Promise(resolve =>
          setTimeout(() => resolve(JSON.stringify([])), 10),
        );
      });

      mockAsyncStorage.setItem.mockImplementation(() => {
        callOrder.push('write');
        return Promise.resolve();
      });

      // Start two save operations concurrently
      const save1 = saveRecipe(mockRecipe1);
      const save2 = saveRecipe(mockRecipe2);

      await Promise.all([save1, save2]);

      // Should see sequential read-write-read-write, not interleaved
      expect(callOrder).toEqual(['read', 'write', 'read', 'write']);
    });
  });

  describe('cache behavior', () => {
    it('invalidates cache after write operations', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([mockRecipe1]));
      mockAsyncStorage.setItem.mockResolvedValue();

      // First read - populates cache
      await getRecipes();
      expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(1);

      // Write operation should invalidate cache
      await saveRecipe(mockRecipe2);

      // Next read should hit storage again
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify([mockRecipe1, mockRecipe2]),
      );
      await getRecipes();

      // Should have called getItem twice total
      expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(2); // 1 initial + 1 for second get (cache was invalidated)
    });

    it('can manually invalidate cache', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([mockRecipe1]));

      // First read - populates cache
      await getRecipes();
      expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(1);

      // Manually invalidate
      invalidateCache();

      // Next read should hit storage
      await getRecipes();
      expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(2);
    });
  });
});
