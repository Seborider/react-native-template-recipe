import { useState, useMemo, useCallback } from 'react';
import { Recipe } from '../types/Recipe';
import {
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_IMAGES,
} from '../constants';

export { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_IMAGES };

export const useRecipeForm = (initialRecipe?: Recipe) => {
  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [description, setDescription] = useState(
    initialRecipe?.description || '',
  );
  const [images, setImages] = useState<string[]>(initialRecipe?.images || []);

  const trimmedTitle = useMemo(() => title.trim(), [title]);
  const trimmedDescription = useMemo(() => description.trim(), [description]);

  const hasChanges = useMemo(() => {
    if (!initialRecipe) {
      return !!(trimmedTitle || trimmedDescription || images.length > 0);
    }

    return (
      trimmedTitle !== initialRecipe.title.trim() ||
      trimmedDescription !== initialRecipe.description.trim() ||
      JSON.stringify(images) !== JSON.stringify(initialRecipe.images)
    );
  }, [trimmedTitle, trimmedDescription, images, initialRecipe]);

  const validate = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!trimmedTitle) {
      errors.push('Please enter a title for your recipe.');
    }

    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      errors.push(`Title must be less than ${MAX_TITLE_LENGTH} characters.`);
    }

    if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
      errors.push(
        `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters.`,
      );
    }

    if (images.length > MAX_IMAGES) {
      errors.push(`You can only add up to ${MAX_IMAGES} images.`);
    }

    return { isValid: errors.length === 0, errors };
  }, [trimmedTitle, trimmedDescription, images]);

  const getRecipeData = useCallback((): Recipe => {
    const now = new Date();
    return {
      id: initialRecipe?.id || Date.now().toString(),
      title: trimmedTitle,
      description: trimmedDescription,
      images,
      createdAt: initialRecipe?.createdAt || now,
      updatedAt: now,
    };
  }, [initialRecipe, trimmedTitle, trimmedDescription, images]);

  return {
    title,
    setTitle,
    description,
    setDescription,
    images,
    setImages,
    hasChanges,
    validate,
    getRecipeData,
  };
};
