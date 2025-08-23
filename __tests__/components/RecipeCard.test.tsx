import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { RecipeCard } from '../../src/components/ui/RecipeCard';
import { Recipe } from '../../src/types/Recipe';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockRecipe: Recipe = {
  id: '1',
  title: 'Test Recipe',
  description: 'Test description',
  images: ['https://example.com/image1.jpg'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('RecipeCard', () => {
  const mockOnPress = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
      />,
    );
    expect(screen.getByText('Test Recipe')).toBeTruthy();
  });

  it('displays recipe title and description', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText('Test Recipe')).toBeTruthy();
    expect(screen.getByText('Test description')).toBeTruthy();
  });

  it('handles recipe without onPress callback', () => {
    render(<RecipeCard recipe={mockRecipe} onDelete={mockOnDelete} />);
    expect(screen.getByText('Test Recipe')).toBeTruthy();
  });

  it('handles long recipe titles', () => {
    const longTitleRecipe: Recipe = {
      ...mockRecipe,
      title:
        'This is a very long recipe title that might cause issues in the confirmation dialog',
    };

    render(
      <RecipeCard
        recipe={longTitleRecipe}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText(longTitleRecipe.title)).toBeTruthy();
  });

  it('renders images when recipe has images', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByLabelText('1 recipe image')).toBeTruthy();
    expect(screen.getByLabelText('Recipe image 1 of 1')).toBeTruthy();
  });

  it('shows empty state when recipe has no images', () => {
    const recipeWithoutImages: Recipe = {
      ...mockRecipe,
      images: [],
    };

    render(
      <RecipeCard
        recipe={recipeWithoutImages}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText('No images')).toBeTruthy();
  });
});
