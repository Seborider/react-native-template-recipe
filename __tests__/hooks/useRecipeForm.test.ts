import { renderHook, act } from '@testing-library/react-native';
import { useRecipeForm } from '../../src/hooks/useRecipeForm';
import { Recipe } from '../../src/types/Recipe';
import {
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_IMAGES,
} from '../../src/constants';
import { describe, it, expect } from '@jest/globals';

describe('useRecipeForm', () => {
  const mockRecipe: Recipe = {
    id: '123',
    title: 'Test Recipe',
    description: 'Test Description',
    images: ['image1.jpg', 'image2.jpg'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  };

  describe('initialization', () => {
    it('initializes with empty values when no initial recipe provided', () => {
      const { result } = renderHook(() => useRecipeForm());

      expect(result.current.title).toBe('');
      expect(result.current.description).toBe('');
      expect(result.current.images).toEqual([]);
      expect(result.current.hasChanges).toBe(false);
    });

    it('initializes with provided recipe values', () => {
      const { result } = renderHook(() => useRecipeForm(mockRecipe));

      expect(result.current.title).toBe('Test Recipe');
      expect(result.current.description).toBe('Test Description');
      expect(result.current.images).toEqual(['image1.jpg', 'image2.jpg']);
      expect(result.current.hasChanges).toBe(false);
    });
  });

  describe('state updates', () => {
    it('updates title correctly', () => {
      const { result } = renderHook(() => useRecipeForm());

      act(() => {
        result.current.setTitle('New Title');
      });

      expect(result.current.title).toBe('New Title');
      expect(result.current.hasChanges).toBe(true);
    });

    it('updates description correctly', () => {
      const { result } = renderHook(() => useRecipeForm());

      act(() => {
        result.current.setDescription('New Description');
      });

      expect(result.current.description).toBe('New Description');
      expect(result.current.hasChanges).toBe(true);
    });

    it('updates images correctly', () => {
      const { result } = renderHook(() => useRecipeForm());

      act(() => {
        result.current.setImages(['new1.jpg', 'new2.jpg']);
      });

      expect(result.current.images).toEqual(['new1.jpg', 'new2.jpg']);
      expect(result.current.hasChanges).toBe(true);
    });
  });

  describe('hasChanges detection', () => {
    it('detects changes when title is modified', () => {
      const { result } = renderHook(() => useRecipeForm(mockRecipe));

      expect(result.current.hasChanges).toBe(false);

      act(() => {
        result.current.setTitle('Modified Title');
      });

      expect(result.current.hasChanges).toBe(true);
    });

    it('detects changes when description is modified', () => {
      const { result } = renderHook(() => useRecipeForm(mockRecipe));

      act(() => {
        result.current.setDescription('Modified Description');
      });

      expect(result.current.hasChanges).toBe(true);
    });

    it('detects changes when images are modified', () => {
      const { result } = renderHook(() => useRecipeForm(mockRecipe));

      act(() => {
        result.current.setImages(['new1.jpg']);
      });

      expect(result.current.hasChanges).toBe(true);
    });

    it('handles whitespace trimming in change detection', () => {
      const { result } = renderHook(() => useRecipeForm(mockRecipe));

      act(() => {
        result.current.setTitle('  Test Recipe  ');
      });

      expect(result.current.hasChanges).toBe(false);

      act(() => {
        result.current.setTitle('  Different Title  ');
      });

      expect(result.current.hasChanges).toBe(true);
    });

    it('detects changes from empty state', () => {
      const { result } = renderHook(() => useRecipeForm());

      expect(result.current.hasChanges).toBe(false);

      act(() => {
        result.current.setTitle('Some Title');
      });

      expect(result.current.hasChanges).toBe(true);
    });
  });

  describe('validation', () => {
    it('validates empty title as invalid', () => {
      const { result } = renderHook(() => useRecipeForm());

      const validation = result.current.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        'Please enter a title for your recipe.',
      );
    });

    it('validates whitespace-only title as invalid', () => {
      const { result } = renderHook(() => useRecipeForm());

      act(() => {
        result.current.setTitle('   ');
      });

      const validation = result.current.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        'Please enter a title for your recipe.',
      );
    });

    it('validates title length', () => {
      const { result } = renderHook(() => useRecipeForm());

      act(() => {
        result.current.setTitle('a'.repeat(MAX_TITLE_LENGTH + 1));
      });

      const validation = result.current.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        `Title must be less than ${MAX_TITLE_LENGTH} characters.`,
      );
    });

    it('validates description length', () => {
      const { result } = renderHook(() => useRecipeForm());

      act(() => {
        result.current.setTitle('Valid Title');
        result.current.setDescription('a'.repeat(MAX_DESCRIPTION_LENGTH + 1));
      });

      const validation = result.current.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters.`,
      );
    });

    it('validates maximum images count', () => {
      const { result } = renderHook(() => useRecipeForm());

      act(() => {
        result.current.setTitle('Valid Title');
        result.current.setImages(Array(MAX_IMAGES + 1).fill('image.jpg'));
      });

      const validation = result.current.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        `You can only add up to ${MAX_IMAGES} images.`,
      );
    });

    it('validates successfully with valid data', () => {
      const { result } = renderHook(() => useRecipeForm());

      act(() => {
        result.current.setTitle('Valid Title');
        result.current.setDescription('Valid description');
        result.current.setImages(['image1.jpg', 'image2.jpg']);
      });

      const validation = result.current.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('accumulates multiple validation errors', () => {
      const { result } = renderHook(() => useRecipeForm());

      act(() => {
        result.current.setTitle('a'.repeat(MAX_TITLE_LENGTH + 1));
        result.current.setDescription('a'.repeat(MAX_DESCRIPTION_LENGTH + 1));
        result.current.setImages(Array(MAX_IMAGES + 1).fill('image.jpg'));
      });

      const validation = result.current.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(3);
    });
  });

  describe('getRecipeData', () => {
    it('generates recipe data for new recipe', () => {
      const { result } = renderHook(() => useRecipeForm());

      act(() => {
        result.current.setTitle('New Recipe');
        result.current.setDescription('New Description');
        result.current.setImages(['image1.jpg']);
      });

      const recipeData = result.current.getRecipeData();

      expect(recipeData.title).toBe('New Recipe');
      expect(recipeData.description).toBe('New Description');
      expect(recipeData.images).toEqual(['image1.jpg']);
      expect(recipeData.id).toBeDefined();
      expect(recipeData.createdAt).toBeInstanceOf(Date);
      expect(recipeData.updatedAt).toBeInstanceOf(Date);
    });

    it('preserves existing recipe data when editing', () => {
      const { result } = renderHook(() => useRecipeForm(mockRecipe));

      act(() => {
        result.current.setTitle('Updated Title');
      });

      const recipeData = result.current.getRecipeData();

      expect(recipeData.id).toBe('123');
      expect(recipeData.createdAt).toEqual(new Date('2023-01-01'));
      expect(recipeData.title).toBe('Updated Title');
      expect(recipeData.updatedAt).toBeInstanceOf(Date);
    });

    it('trims whitespace in recipe data', () => {
      const { result } = renderHook(() => useRecipeForm());

      act(() => {
        result.current.setTitle('  Trimmed Title  ');
        result.current.setDescription('  Trimmed Description  ');
      });

      const recipeData = result.current.getRecipeData();

      expect(recipeData.title).toBe('Trimmed Title');
      expect(recipeData.description).toBe('Trimmed Description');
    });
  });

  describe('edge cases', () => {
    it('handles undefined initial recipe gracefully', () => {
      const { result } = renderHook(() => useRecipeForm(undefined));

      expect(result.current.title).toBe('');
      expect(result.current.description).toBe('');
      expect(result.current.images).toEqual([]);
      expect(result.current.hasChanges).toBe(false);
    });

    it('handles recipe with missing optional fields', () => {
      const incompleteRecipe = {
        id: '123',
        title: 'Title',
        description: '',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Recipe;

      const { result } = renderHook(() => useRecipeForm(incompleteRecipe));

      expect(result.current.title).toBe('Title');
      expect(result.current.description).toBe('');
      expect(result.current.images).toEqual([]);
    });
  });
});
