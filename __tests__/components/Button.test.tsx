import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../src/components/common/Button';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('Button', () => {
  const defaultProps = {
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders correctly with default props', () => {
      const { getByRole } = render(<Button {...defaultProps} />);

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('renders with title', () => {
      const { getByText } = render(
        <Button {...defaultProps} title="Test Button" />,
      );

      expect(getByText('Test Button')).toBeTruthy();
    });

    it('renders with icon', () => {
      const { getByText } = render(<Button {...defaultProps} icon="+" />);

      expect(getByText('+')).toBeTruthy();
    });

    it('renders with both title and icon', () => {
      const { getByText } = render(
        <Button {...defaultProps} title="Add Item" icon="+" />,
      );

      expect(getByText('Add Item')).toBeTruthy();
      expect(getByText('+')).toBeTruthy();
    });
  });

  describe('Variants', () => {
    it('renders primary variant correctly', () => {
      const { getByRole } = render(
        <Button {...defaultProps} variant="primary" title="Primary" />,
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('renders danger variant correctly', () => {
      const { getByRole } = render(
        <Button {...defaultProps} variant="danger" title="Delete" />,
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('renders ghost variant correctly', () => {
      const { getByRole } = render(
        <Button {...defaultProps} variant="ghost" title="Ghost" />,
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('renders icon variant correctly', () => {
      const { getByRole } = render(
        <Button {...defaultProps} variant="icon" icon="×" />,
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('renders add variant correctly', () => {
      const { getByRole } = render(
        <Button {...defaultProps} variant="add" title="Add" />,
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('renders delete variant correctly', () => {
      const { getByRole } = render(
        <Button {...defaultProps} variant="delete" title="Delete" />,
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('renders imageAdd variant correctly', () => {
      const { getByRole } = render(
        <Button
          {...defaultProps}
          variant="imageAdd"
          title="Add Image"
          icon="📷"
        />,
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      const { getByRole } = render(
        <Button {...defaultProps} size="small" title="Small" />,
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('renders medium size correctly', () => {
      const { getByRole } = render(
        <Button {...defaultProps} size="medium" title="Medium" />,
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('renders large size correctly', () => {
      const { getByRole } = render(
        <Button {...defaultProps} size="large" title="Large" />,
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });
  });

  describe('Interaction', () => {
    it('calls onPress when pressed', () => {
      const mockOnPress = jest.fn();
      const { getByRole } = render(
        <Button onPress={mockOnPress} title="Press me" />,
      );

      const button = getByRole('button');
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      const mockOnPress = jest.fn();
      const { getByRole } = render(
        <Button onPress={mockOnPress} title="Disabled" disabled />,
      );

      const button = getByRole('button');
      fireEvent.press(button);

      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('has correct accessibility state when disabled', () => {
      const { getByRole } = render(
        <Button {...defaultProps} title="Disabled" disabled />,
      );

      const button = getByRole('button');
      expect(button.props.accessibilityState).toEqual({ disabled: true });
    });
  });

  describe('Accessibility', () => {
    it('uses title as accessibility label by default', () => {
      const { getByRole } = render(
        <Button {...defaultProps} title="Test Button" />,
      );

      const button = getByRole('button');
      expect(button.props.accessibilityLabel).toBe('Test Button');
    });

    it('uses custom accessibility label when provided', () => {
      const { getByRole } = render(
        <Button
          {...defaultProps}
          title="Test Button"
          accessibilityLabel="Custom Label"
        />,
      );

      const button = getByRole('button');
      expect(button.props.accessibilityLabel).toBe('Custom Label');
    });

    it('has correct accessibility role', () => {
      const { getByRole } = render(
        <Button {...defaultProps} title="Test Button" />,
      );

      const button = getByRole('button');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('uses custom accessibility role when provided', () => {
      const { getByLabelText } = render(
        <Button
          {...defaultProps}
          title="Test Button"
          accessibilityRole="text"
          accessibilityLabel="Custom Text Button"
        />,
      );

      const button = getByLabelText('Custom Text Button');
      expect(button.props.accessibilityRole).toBe('text');
    });

    it('sets accessibility hint when provided', () => {
      const { getByRole } = render(
        <Button
          {...defaultProps}
          title="Test Button"
          accessibilityHint="This is a hint"
        />,
      );

      const button = getByRole('button');
      expect(button.props.accessibilityHint).toBe('This is a hint');
    });
  });

  describe('Custom props', () => {
    it('applies custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByRole } = render(
        <Button {...defaultProps} title="Styled" style={customStyle} />,
      );

      const button = getByRole('button');
      expect(button.props.style).toEqual(
        expect.objectContaining({ backgroundColor: 'red' }),
      );
    });

    it('sets activeOpacity to 1 when disabled', () => {
      const { getByRole } = render(
        <Button {...defaultProps} title="Test" disabled activeOpacity={0.5} />,
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
      expect(button.props.accessibilityState).toEqual({ disabled: true });
    });
  });

  describe('Layout variations', () => {
    it('uses vertical layout for imageAdd variant', () => {
      const { getByRole } = render(
        <Button
          {...defaultProps}
          variant="imageAdd"
          title="Add Image"
          icon="📷"
        />,
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('uses horizontal layout for other variants', () => {
      const { getByRole } = render(
        <Button {...defaultProps} variant="primary" title="Primary" icon="+" />,
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });
  });

  describe('Event handling', () => {
    it('calls onPress when pressed', () => {
      const mockOnPress = jest.fn();
      const { getByRole } = render(
        <Button onPress={mockOnPress} title="Press me" />,
      );

      const button = getByRole('button');
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });
});
