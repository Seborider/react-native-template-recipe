import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FormInput } from '../../src/components/common/FormInput';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('FormInput', () => {
  const defaultProps = {
    label: 'Test Label',
    value: '',
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with basic props', () => {
    const { getByText, getByDisplayValue } = render(
      <FormInput {...defaultProps} value="test value" />,
    );

    expect(getByText('Test Label')).toBeTruthy();
    expect(getByDisplayValue('test value')).toBeTruthy();
  });

  it('shows required asterisk when required prop is true', () => {
    const { getByText } = render(<FormInput {...defaultProps} required />);

    expect(getByText('Test Label *')).toBeTruthy();
  });

  it('shows character count when showCharacterCount is true', () => {
    const { getByText } = render(
      <FormInput
        {...defaultProps}
        value="hello"
        maxLength={100}
        showCharacterCount
      />,
    );

    expect(getByText('5/100')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const mockOnChangeText = jest.fn();
    const { getByDisplayValue } = render(
      <FormInput {...defaultProps} onChangeText={mockOnChangeText} />,
    );

    const input = getByDisplayValue('');
    fireEvent.changeText(input, 'new text');

    expect(mockOnChangeText).toHaveBeenCalledWith('new text');
  });

  it('renders multiline input when multiline prop is true', () => {
    const { getByDisplayValue } = render(
      <FormInput {...defaultProps} multiline numberOfLines={4} />,
    );

    const input = getByDisplayValue('');
    expect(input.props.multiline).toBe(true);
    expect(input.props.numberOfLines).toBe(4);
  });

  it('shows error message when error prop is provided', () => {
    const { getByText } = render(
      <FormInput {...defaultProps} error="This field is required" />,
    );

    expect(getByText('This field is required')).toBeTruthy();
  });

  it('applies placeholder correctly', () => {
    const { getByPlaceholderText } = render(
      <FormInput {...defaultProps} placeholder="Enter text here" />,
    );

    expect(getByPlaceholderText('Enter text here')).toBeTruthy();
  });

  it('applies accessibility properties correctly', () => {
    const { getByLabelText } = render(
      <FormInput {...defaultProps} accessibilityHint="This is a hint" />,
    );

    const input = getByLabelText('Test Label');
    expect(input.props.accessibilityHint).toBe('This is a hint');
  });

  it('applies maxLength correctly', () => {
    const { getByDisplayValue } = render(
      <FormInput {...defaultProps} maxLength={50} />,
    );

    const input = getByDisplayValue('');
    expect(input.props.maxLength).toBe(50);
  });

  it('shows required fields hint when showRequiredFieldsHint is true and field is required', () => {
    const { getByText } = render(
      <FormInput {...defaultProps} required showRequiredFieldsHint />,
    );

    expect(getByText('* indicates field is required')).toBeTruthy();
  });

  it('does not show required fields hint when showRequiredFieldsHint is true but field is not required', () => {
    const { queryByText } = render(
      <FormInput {...defaultProps} showRequiredFieldsHint />,
    );

    expect(queryByText('* indicates required field')).toBeFalsy();
  });

  it('does not show required fields hint when showRequiredFieldsHint is false', () => {
    const { queryByText } = render(<FormInput {...defaultProps} required />);

    expect(queryByText('* indicates required field')).toBeFalsy();
  });
});
