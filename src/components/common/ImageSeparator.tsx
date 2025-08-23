import React, { memo } from 'react';
import { View, ViewProps } from 'react-native';
import { DEFAULT_SPACING } from '../../constants';

interface ImageSeparatorProps extends ViewProps {
  spacing?: number;
}

export const ImageSeparator = memo<ImageSeparatorProps>(
  ({ spacing = DEFAULT_SPACING, style, ...props }) => (
    <View style={[{ width: spacing }, style]} {...props} />
  ),
);

ImageSeparator.displayName = 'ImageSeparator';
