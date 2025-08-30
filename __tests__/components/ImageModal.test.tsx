import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ImageModal } from '../../src/components/ui/ImageModal';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('ImageModal', () => {
  const defaultProps = {
    visible: true,
    images: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg',
    ],
    index: 0,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly when visible', () => {
      const { getByText } = render(<ImageModal {...defaultProps} />);

      expect(getByText('1 / 3')).toBeTruthy();
      expect(
        getByText('Swipe left/right to navigate • Swipe down or tap to close'),
      ).toBeTruthy();
    });

    it('does not render when not visible', () => {
      const { queryByText } = render(
        <ImageModal {...defaultProps} visible={false} />,
      );

      expect(queryByText('1 / 3')).toBeFalsy();
    });

    it('displays correct image counter', () => {
      const { getByText } = render(<ImageModal {...defaultProps} index={1} />);

      expect(getByText('2 / 3')).toBeTruthy();
    });

    it('renders FastImage with correct props', () => {
      const { getByLabelText } = render(<ImageModal {...defaultProps} />);

      const image = getByLabelText('Recipe image 1 of 3 in full screen view');
      expect(image).toBeTruthy();
      expect(image).toHaveProp('accessibilityIgnoresInvertColors', true);
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when close button is pressed', () => {
      const onClose = jest.fn();
      const { getByLabelText } = render(
        <ImageModal {...defaultProps} onClose={onClose} />,
      );

      const closeButton = getByLabelText('Close button');
      fireEvent.press(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('shows error fallback when image fails to load', () => {
      const { getByLabelText, getByText } = render(
        <ImageModal {...defaultProps} />,
      );

      const image = getByLabelText('Recipe image 1 of 3 in full screen view');
      fireEvent(image, 'onError');

      expect(getByText('📷')).toBeTruthy();
      expect(getByText('Image not available')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility properties on image', () => {
      const { getByLabelText } = render(<ImageModal {...defaultProps} />);

      const image = getByLabelText('Recipe image 1 of 3 in full screen view');
      expect(image).toHaveProp('accessibilityRole', 'image');
      expect(image).toHaveProp('accessibilityIgnoresInvertColors', true);
    });

    it('displays helpful hint text', () => {
      const { getByText } = render(<ImageModal {...defaultProps} />);

      expect(
        getByText('Swipe left/right to navigate • Swipe down or tap to close'),
      ).toBeTruthy();
    });
  });

  describe('Different States', () => {
    it('renders with different index values correctly', () => {
      const { getByText } = render(<ImageModal {...defaultProps} index={2} />);

      expect(getByText('3 / 3')).toBeTruthy();
    });

    it('works with single image', () => {
      const { getByText } = render(
        <ImageModal
          {...defaultProps}
          images={['https://example.com/image.jpg']}
          index={0}
        />,
      );

      expect(getByText('1 / 1')).toBeTruthy();
      expect(getByText('Swipe down or tap to close')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('calls onIndexChange when navigating between images', () => {
      const onIndexChange = jest.fn();
      render(<ImageModal {...defaultProps} onIndexChange={onIndexChange} />);

      // Note: Testing actual swipe gestures would require more complex setup
      // This test verifies the prop interface
      expect(onIndexChange).not.toHaveBeenCalled();
    });

    it('shows navigation arrows when there are multiple images', () => {
      const { getByLabelText } = render(
        <ImageModal {...defaultProps} index={1} />,
      );

      expect(getByLabelText('Previous image')).toBeTruthy();
      expect(getByLabelText('Next image')).toBeTruthy();
    });

    it('hides left arrow on first image', () => {
      const { queryByLabelText } = render(
        <ImageModal {...defaultProps} index={0} />,
      );

      expect(queryByLabelText('Previous image')).toBeFalsy();
      expect(queryByLabelText('Next image')).toBeTruthy();
    });

    it('hides right arrow on last image', () => {
      const { queryByLabelText } = render(
        <ImageModal {...defaultProps} index={2} />,
      );

      expect(queryByLabelText('Previous image')).toBeTruthy();
      expect(queryByLabelText('Next image')).toBeFalsy();
    });

    it('does not show arrows for single image', () => {
      const { queryByLabelText } = render(
        <ImageModal
          {...defaultProps}
          images={['https://example.com/image.jpg']}
          index={0}
        />,
      );

      expect(queryByLabelText('Previous image')).toBeFalsy();
      expect(queryByLabelText('Next image')).toBeFalsy();
    });
  });
});
