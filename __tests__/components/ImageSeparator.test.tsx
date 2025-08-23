import React from 'react';
import { render } from '@testing-library/react-native';
import { ImageSeparator } from '../../src/components/common/ImageSeparator';
import { describe, it, expect } from '@jest/globals';

describe('ImageSeparator', () => {
  it('renders successfully', () => {
    const { getByTestId } = render(<ImageSeparator testID="separator" />);
    const separator = getByTestId('separator');

    expect(separator).toBeTruthy();
  });

  it('renders with custom spacing', () => {
    const { getByTestId } = render(
      <ImageSeparator spacing={12} testID="separator" />,
    );
    const separator = getByTestId('separator');

    expect(separator).toBeTruthy();
  });

  it('has correct display name', () => {
    expect(ImageSeparator.displayName).toBe('ImageSeparator');
  });
});
