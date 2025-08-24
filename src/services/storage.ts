import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '../types/Recipe';
import { CACHE_TIMEOUT } from '../constants';

const RECIPES_STORAGE_KEY = '@recipes';

const storageError = (message: string, operation: string): Error =>
  new Error(`[Storage:${operation}] ${message}`);

let cache: { data: Recipe[] | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

let mutexPromise = Promise.resolve();

const withMutex = <T>(fn: () => Promise<T>): Promise<T> => {
  const result = mutexPromise.then(fn);
  mutexPromise = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
};

// Date parsing helper
const parseDate = (value: unknown): Date => {
  if (value instanceof Date) {
    return value;
  }
  const parsed = new Date(value as string | number);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

const readFromStorage = async (): Promise<Recipe[]> => {
  try {
    const json = await AsyncStorage.getItem(RECIPES_STORAGE_KEY);
    if (!json) {
      return [];
    }

    const data = JSON.parse(json);
    if (!Array.isArray(data)) {
      return [];
    }

    // Convert dates during deserialization
    return data.map((recipe: Recipe) => ({
      ...recipe,
      createdAt: parseDate(recipe.createdAt),
      updatedAt: recipe.updatedAt ? parseDate(recipe.updatedAt) : new Date(),
    }));
  } catch (error) {
    console.error('Storage read error:', error);
    return [];
  }
};

const writeToStorage = async (recipes: Recipe[]): Promise<void> => {
  const serialized = recipes.map(recipe => ({
    ...recipe,
    createdAt: recipe.createdAt?.toISOString(),
    updatedAt: recipe.updatedAt?.toISOString(),
  }));

  await AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(serialized));

  // Update cache
  cache = { data: recipes, timestamp: Date.now() };
};

export const getRecipes = async (): Promise<Recipe[]> => {
  // Check cache validity
  if (cache.data && Date.now() - cache.timestamp < CACHE_TIMEOUT) {
    return cache.data;
  }

  // Read with mutex protection
  return withMutex(async () => {
    const recipes = await readFromStorage();
    cache = { data: recipes, timestamp: Date.now() };
    return recipes;
  });
};

export const saveRecipe = async (recipe: Recipe): Promise<void> => {
  if (!recipe.id) {
    throw storageError('Recipe must have an ID', 'save');
  }

  return withMutex(async () => {
    const recipes = await readFromStorage();

    // Check for duplicates
    if (recipes.some(r => r.id === recipe.id)) {
      throw storageError(`Recipe ${recipe.id} already exists`, 'save');
    }

    const newRecipe = {
      ...recipe,
      createdAt: recipe.createdAt || new Date(),
      updatedAt: new Date(),
    };

    await writeToStorage([...recipes, newRecipe]);
  });
};

export const updateRecipe = async (recipe: Recipe): Promise<void> => {
  if (!recipe.id) {
    throw storageError('Recipe must have an ID', 'update');
  }

  return withMutex(async () => {
    const recipes = await readFromStorage();
    const index = recipes.findIndex(r => r.id === recipe.id);

    if (index === -1) {
      throw storageError(`Recipe ${recipe.id} not found`, 'update');
    }

    const updated = [...recipes];
    updated[index] = {
      ...recipe,
      createdAt: recipes[index].createdAt,
      updatedAt: new Date(),
    };

    await writeToStorage(updated);
  });
};

export const deleteRecipe = async (recipeId: string): Promise<void> => {
  if (!recipeId) {
    throw storageError('Recipe ID required', 'delete');
  }

  return withMutex(async () => {
    const recipes = await readFromStorage();
    const filtered = recipes.filter(r => r.id !== recipeId);

    if (filtered.length === recipes.length) {
      throw storageError(`Recipe ${recipeId} not found`, 'delete');
    }

    await writeToStorage(filtered);
  });
};

// Utility to invalidate cache (useful for testing)
export const invalidateCache = () => {
  cache = { data: null, timestamp: 0 };
};
