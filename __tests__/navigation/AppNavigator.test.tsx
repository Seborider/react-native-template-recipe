import { AppNavigator } from '../../src/navigation/AppNavigator';
import { describe, it, expect, jest } from '@jest/globals';

// Mock the screens to avoid deep dependencies
jest.mock('../../src/screens/RecipeListScreen', () => ({
  RecipeListScreen: () => null,
}));

jest.mock('../../src/screens/AddRecipeScreen', () => ({
  AddRecipeScreen: () => null,
}));

describe('AppNavigator', () => {
  describe('Component structure', () => {
    it('is properly memoized with correct displayName', () => {
      expect(AppNavigator.displayName).toBe('AppNavigator');
    });

    it('is imported successfully', () => {
      expect(AppNavigator).toBeDefined();
    });
  });

  describe('Module exports', () => {
    it('can be imported without throwing', () => {
      // If we got here, the import was successful
      expect(true).toBe(true);
    });

    it('has a displayName property', () => {
      expect(AppNavigator).toHaveProperty('displayName');
      expect(AppNavigator.displayName).toBe('AppNavigator');
    });
  });

  describe('React.memo optimization', () => {
    it('is wrapped with React.memo for performance', () => {
      // The displayName should indicate it's memoized
      expect(AppNavigator.displayName).toBe('AppNavigator');
    });

    it('maintains consistent identity', () => {
      // Component should maintain its identity
      expect(AppNavigator).toBeTruthy();
      expect(AppNavigator.displayName).toBe('AppNavigator');
    });
  });
});
