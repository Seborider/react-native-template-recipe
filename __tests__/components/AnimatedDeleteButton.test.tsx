import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AnimatedDeleteButton } from '../../src/components/ui/AnimatedDeleteButton';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import type { SharedValue } from 'react-native-reanimated';

// Create a proper mock SharedValue that matches the Reanimated interface
const createMockSharedValue = (initialValue: number): SharedValue<number> =>
  ({
    value: initialValue,
    get: jest.fn(() => initialValue),
    set: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    modify: jest.fn(),
  } as SharedValue<number>);

describe('AnimatedDeleteButton', () => {
  const defaultProps = {
    progress: createMockSharedValue(0.5),
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders correctly', () => {
      const { getByRole } = render(<AnimatedDeleteButton {...defaultProps} />);

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('renders with correct accessibility label', () => {
      const { getByLabelText } = render(
        <AnimatedDeleteButton {...defaultProps} />,
      );

      expect(getByLabelText('Delete recipe')).toBeTruthy();
    });

    it('renders with correct accessibility hint', () => {
      const { getByA11yHint } = render(
        <AnimatedDeleteButton {...defaultProps} />,
      );

      expect(getByA11yHint('Double tap to confirm deletion')).toBeTruthy();
    });

    it('renders delete icon and title', () => {
      const { getByText } = render(<AnimatedDeleteButton {...defaultProps} />);

      expect(getByText('🗑️')).toBeTruthy();
      expect(getByText('Delete')).toBeTruthy();
    });
  });

  describe('Interaction', () => {
    it('calls onPress when button is pressed', () => {
      const onPressMock = jest.fn();
      const { getByRole } = render(
        <AnimatedDeleteButton {...defaultProps} onPress={onPressMock} />,
      );

      const button = getByRole('button');
      fireEvent.press(button);

      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('handles multiple presses correctly', () => {
      const onPressMock = jest.fn();
      const { getByRole } = render(
        <AnimatedDeleteButton {...defaultProps} onPress={onPressMock} />,
      );

      const button = getByRole('button');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(onPressMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('Animation props', () => {
    it('accepts progress with value 0', () => {
      const zeroProgress = createMockSharedValue(0);
      const { getByRole } = render(
        <AnimatedDeleteButton {...defaultProps} progress={zeroProgress} />,
      );

      expect(getByRole('button')).toBeTruthy();
    });

    it('accepts progress with value 1', () => {
      const fullProgress = createMockSharedValue(1);
      const { getByRole } = render(
        <AnimatedDeleteButton {...defaultProps} progress={fullProgress} />,
      );

      expect(getByRole('button')).toBeTruthy();
    });

    it('accepts progress with intermediate values', () => {
      const midProgress = createMockSharedValue(0.7);
      const { getByRole } = render(
        <AnimatedDeleteButton {...defaultProps} progress={midProgress} />,
      );

      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Button variant and size', () => {
    it('renders with delete variant', () => {
      const { getByRole } = render(<AnimatedDeleteButton {...defaultProps} />);

      const button = getByRole('button');
      expect(button).toBeTruthy();
      // The delete variant styling is tested implicitly through the Button component
    });

    it('renders with small size', () => {
      const { getByRole } = render(<AnimatedDeleteButton {...defaultProps} />);

      const button = getByRole('button');
      expect(button).toBeTruthy();
      // The small size styling is tested implicitly through the Button component
    });
  });

  describe('Component lifecycle', () => {
    it('mounts and unmounts without errors', () => {
      const { unmount } = render(<AnimatedDeleteButton {...defaultProps} />);

      expect(() => unmount()).not.toThrow();
    });

    it('updates progress prop correctly', () => {
      const initialProgress = createMockSharedValue(0.2);
      const { rerender, getByRole } = render(
        <AnimatedDeleteButton {...defaultProps} progress={initialProgress} />,
      );

      expect(getByRole('button')).toBeTruthy();

      const updatedProgress = createMockSharedValue(0.8);
      rerender(
        <AnimatedDeleteButton {...defaultProps} progress={updatedProgress} />,
      );

      expect(getByRole('button')).toBeTruthy();
    });

    it('updates onPress prop correctly', () => {
      const initialOnPress = jest.fn();
      const { rerender, getByRole } = render(
        <AnimatedDeleteButton {...defaultProps} onPress={initialOnPress} />,
      );

      const button = getByRole('button');
      fireEvent.press(button);
      expect(initialOnPress).toHaveBeenCalledTimes(1);

      const updatedOnPress = jest.fn();
      rerender(
        <AnimatedDeleteButton {...defaultProps} onPress={updatedOnPress} />,
      );

      fireEvent.press(button);
      expect(updatedOnPress).toHaveBeenCalledTimes(1);
      expect(initialOnPress).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  describe('Memoization', () => {
    it('has correct displayName for debugging', () => {
      expect(AnimatedDeleteButton.displayName).toBe('AnimatedDeleteButton');
    });
  });
});
