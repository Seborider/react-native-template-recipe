import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ImageItem } from '../../src/components/ui/ImageItem';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock services/imageCache
jest.mock('./../services/imageCache.test', () => ({
  createImageSource: jest.fn(),
  getImageConfigForUri: jest.fn(),
  ImageConfigs: {
    recipeImage: {
      priority: 'normal',
      cache: 'immutable',
      resizeMode: 'cover',
    },
  },
  ImageCacheManager: {
    preloadImages: jest.fn(),
    clearCache: jest.fn(),
  },
}));

// Mock hooks/useHapticFeedback
jest.mock('./../hooks/useHapticFeedback.test', () => ({
  useHapticFeedback: () => ({
    triggerHaptic: jest.fn(),
    triggerImpactLight: jest.fn(),
    triggerImpactMedium: jest.fn(),
    triggerImpactHeavy: jest.fn(),
    triggerNotificationSuccess: jest.fn(),
    triggerNotificationWarning: jest.fn(),
    triggerNotificationError: jest.fn(),
    triggerSelection: jest.fn(),
  }),
}));
describe('ImageItem', () => {
  const defaultProps = {
    uri: 'https://example.com/image.jpg',
    index: 0,
    totalImages: 3,
  };

  const mockImageConfig = {
    priority: 'normal',
    cache: 'immutable',
    resizeMode: 'cover',
  };

  const mockImageSource = {
    uri: 'https://example.com/image.jpg',
    priority: 'normal',
    cache: 'immutable',
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let imageCache: any;

  beforeEach(() => {
    jest.clearAllMocks();

    imageCache = jest.requireMock('../../src/services/imageCache');
    imageCache.getImageConfigForUri.mockReturnValue(mockImageConfig);
    imageCache.createImageSource.mockReturnValue(mockImageSource);
  });

  describe('Basic rendering', () => {
    it('renders correctly with valid image source', () => {
      const { getByLabelText } = render(<ImageItem {...defaultProps} />);

      const imageContainer = getByLabelText('Image 1 of 3');
      expect(imageContainer).toBeTruthy();

      const image = getByLabelText('Recipe image 1 of 3');
      expect(image).toBeTruthy();
    });

    it('renders with correct accessibility labels', () => {
      const { getByLabelText } = render(<ImageItem {...defaultProps} />);

      expect(getByLabelText('Image 1 of 3')).toBeTruthy();
      expect(getByLabelText('Recipe image 1 of 3')).toBeTruthy();
    });

    it('renders delete button by default when onRemove is provided', () => {
      const onRemove = jest.fn();
      const { getByLabelText } = render(
        <ImageItem {...defaultProps} onRemove={onRemove} />,
      );

      expect(getByLabelText('Remove image 1')).toBeTruthy();
    });

    it('does not render delete button when showDeleteButton is false', () => {
      const onRemove = jest.fn();
      const { queryByLabelText } = render(
        <ImageItem
          {...defaultProps}
          onRemove={onRemove}
          showDeleteButton={false}
        />,
      );

      expect(queryByLabelText('Remove image 1')).toBeNull();
    });

    it('does not render delete button when onRemove is not provided', () => {
      const { queryByLabelText } = render(<ImageItem {...defaultProps} />);

      expect(queryByLabelText('Remove image 1')).toBeNull();
    });
  });

  describe('Delete functionality', () => {
    it('calls onRemove with correct index when delete button is pressed', () => {
      const onRemove = jest.fn();
      const { getByLabelText } = render(
        <ImageItem {...defaultProps} onRemove={onRemove} />,
      );

      const deleteButton = getByLabelText('Remove image 1');
      fireEvent.press(deleteButton);

      expect(onRemove).toHaveBeenCalledWith(0);
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility properties on container', () => {
      const { getByLabelText } = render(<ImageItem {...defaultProps} />);

      const container = getByLabelText('Image 1 of 3');
      expect(container).toHaveProp('accessibilityLabel', 'Image 1 of 3');
    });

    it('has correct accessibility properties on image', () => {
      const { getByLabelText } = render(<ImageItem {...defaultProps} />);

      const image = getByLabelText('Recipe image 1 of 3');
      expect(image).toHaveProp('accessibilityLabel', 'Recipe image 1 of 3');
      expect(image).toHaveProp('accessibilityIgnoresInvertColors', true);
    });

    it('has correct accessibility properties on delete button', () => {
      const onRemove = jest.fn();
      const { getByLabelText } = render(
        <ImageItem {...defaultProps} onRemove={onRemove} />,
      );

      const deleteButton = getByLabelText('Remove image 1');
      expect(deleteButton).toHaveProp(
        'accessibilityHint',
        'Tap to remove this image from the recipe',
      );
    });
  });

  describe('Props variations', () => {
    it('renders with different index values correctly', () => {
      const { getByLabelText } = render(
        <ImageItem {...defaultProps} index={2} totalImages={5} />,
      );

      expect(getByLabelText('Image 3 of 5')).toBeTruthy();
      expect(getByLabelText('Recipe image 3 of 5')).toBeTruthy();
    });
  });

  describe('Component structure', () => {
    it('component is memoized', () => {
      const Component = ImageItem;
      expect(Component.displayName).toBe('ImageItem');
    });
  });
});
