import React, { useCallback, useMemo, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Button } from '../common/Button';
import {
  createImageSource,
  getImageConfigForUri,
} from '../../services/imageCache';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { IMAGE_SIZE } from '../../constants';

interface ImageItemProps {
  uri: string;
  index: number;
  totalImages: number;
  onRemove: (index: number) => void;
}

const ImageItem = memo<ImageItemProps>(
  ({ uri, index, totalImages, onRemove }) => {
    const { triggerImpactLight } = useHapticFeedback();

    const handleRemove = useCallback(() => {
      triggerImpactLight();
      onRemove(index);
    }, [index, onRemove, triggerImpactLight]);

    const imageConfig = useMemo(() => getImageConfigForUri(uri), [uri]);
    const imageSource = useMemo(
      () => createImageSource(uri, imageConfig),
      [uri, imageConfig],
    );

    if (!imageSource) {
      console.warn(`Skipping invalid image URI at index ${index}:`, uri);
      return null;
    }

    return (
      <View
        style={styles.imageWrapper}
        accessibilityRole="button"
        accessibilityLabel={`Image ${index + 1} of ${totalImages}`}>
        <FastImage
          source={imageSource}
          style={styles.image}
          accessibilityRole="image"
          accessibilityLabel={`Recipe image ${index + 1}`}
          accessibilityIgnoresInvertColors={true}
          resizeMode={imageConfig.resizeMode}
          onError={() => {
            console.warn(`FastImage failed to load image ${index + 1}:`, uri);
          }}
        />
        <Button
          icon="×"
          variant="danger"
          size="small"
          onPress={handleRemove}
          style={styles.deleteButton}
          textStyle={styles.deleteIconStyle}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          accessibilityLabel={`Remove image ${index + 1}`}
          accessibilityHint="Tap to remove this image from the recipe"
        />
      </View>
    );
  },
);

ImageItem.displayName = 'ImageItem';

const styles = StyleSheet.create({
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  deleteIconStyle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
    marginRight: 0,
  },
});

export { ImageItem };
export type { ImageItemProps };
