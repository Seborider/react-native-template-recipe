import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ImageList } from '../../src/components/ui/ImageList';

// Mock the dependencies
jest.mock('../../src/components/ui/ImageItem');
jest.mock('../../src/components/common/ImageSeparator');

const MockHeaderComponent = () => (
  <View testID="header-component">
    <Text>Header</Text>
  </View>
);

const MockEmptyComponent = () => (
  <View testID="empty-component">
    <Text>Empty</Text>
  </View>
);

describe('ImageList', () => {
  const mockImages = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
  const mockOnRemoveImage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing with images', () => {
    const component = render(
      <ImageList images={mockImages} onRemoveImage={mockOnRemoveImage} />,
    );

    expect(component).toBeTruthy();
  });

  it('renders without crashing when no images', () => {
    const { getByTestId } = render(
      <ImageList images={[]} ListEmptyComponent={MockEmptyComponent} />,
    );

    expect(getByTestId('empty-component')).toBeTruthy();
  });

  it('renders header component when provided', () => {
    const { getByTestId } = render(
      <ImageList
        images={mockImages}
        ListHeaderComponent={MockHeaderComponent}
      />,
    );

    expect(getByTestId('header-component')).toBeTruthy();
  });

  it('accepts all expected props without crashing', () => {
    const component = render(
      <ImageList
        images={mockImages}
        onRemoveImage={mockOnRemoveImage}
        showDeleteButton={true}
        showErrorFallback={false}
        imageSize={120}
        accessibilityLabel="Test accessibility label"
        keyPrefix="test"
        snapToInterval={true}
        scrollEnabled={true}
      />,
    );

    expect(component).toBeTruthy();
  });

  it('handles empty images array', () => {
    const component = render(
      <ImageList images={[]} onRemoveImage={mockOnRemoveImage} />,
    );

    expect(component).toBeTruthy();
  });
});
