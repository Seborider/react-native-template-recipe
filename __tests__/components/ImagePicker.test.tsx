import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ImagePickerComponent } from '../../src/components/ui/ImagePicker';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('ImagePickerComponent', () => {
  const mockOnImagesChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing when no images', () => {
    render(
      <ImagePickerComponent images={[]} onImagesChange={mockOnImagesChange} />,
    );
    expect(screen.getByText('Gallery')).toBeTruthy();
    expect(screen.getByText('Random')).toBeTruthy();
  });

  it('displays correct number of images', () => {
    const images = [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ];

    render(
      <ImagePickerComponent
        images={images}
        onImagesChange={mockOnImagesChange}
      />,
    );

    expect(screen.getByLabelText('Image 1 of 2')).toBeTruthy();
    expect(screen.getByLabelText('Image 2 of 2')).toBeTruthy();
  });

  it('shows add button when under maxImages limit', () => {
    const images = ['https://example.com/image1.jpg'];

    render(
      <ImagePickerComponent
        images={images}
        onImagesChange={mockOnImagesChange}
        maxImages={5}
      />,
    );

    expect(screen.getByText('Gallery')).toBeTruthy();
    expect(screen.getByLabelText('Add image from gallery')).toBeTruthy();
  });

  it('uses default maxImages of 8', () => {
    const images = Array(7).fill('https://example.com/image.jpg');

    render(
      <ImagePickerComponent
        images={images}
        onImagesChange={mockOnImagesChange}
      />,
    );

    expect(screen.getByText('Gallery')).toBeTruthy();
    expect(
      screen.getByLabelText('Image picker with 7 of 8 images selected'),
    ).toBeTruthy();
  });
});
