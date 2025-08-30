import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  launchImageLibrary,
  MediaType,
  PhotoQuality,
  ImagePickerResponse,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import { ImageCacheManager } from '../../services/imageCache';
import { PicsumUtils } from '../../utils/picsumUtils';
import { ImageList } from './ImageList';
import { AddImageButtons } from './AddImageButtons';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import {
  IMAGE_SIZE,
  MAX_IMAGES,
  DEFAULT_IMAGE_QUALITY,
  MAX_SELECTION_LIMIT,
} from '../../constants';

interface ImagePickerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  imageSize?: number;
  imageQuality?: PhotoQuality;
}

export const ImagePickerComponent: React.FC<ImagePickerProps> = ({
  images,
  onImagesChange,
  maxImages = MAX_IMAGES,
  imageSize = IMAGE_SIZE,
  imageQuality = DEFAULT_IMAGE_QUALITY,
}) => {
  const { triggerImpactLight, triggerImpactMedium } = useHapticFeedback();

  const remainingSlots = useMemo(
    () => maxImages - images.length,
    [maxImages, images.length],
  );

  const handleImagePickerResponse = useCallback(
    (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorCode) {
        if (response.errorCode) {
          // Handle specific error codes if needed
          const errorMessage =
            response.errorCode === 'permission'
              ? 'Permission to access photo library was denied'
              : response.errorMessage || 'Failed to pick image';
          Alert.alert('Error', errorMessage);
        }
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const newImages = response.assets
          .slice(0, remainingSlots) // Ensure we don't exceed the limit
          .map(asset => asset.uri)
          .filter((uri): uri is string => uri !== undefined);

        if (newImages.length > 0) {
          const updatedImages = [...images, ...newImages];
          onImagesChange(updatedImages);
          ImageCacheManager.preloadImages(newImages);
          triggerImpactMedium();
        }
      }
    },
    [images, onImagesChange, remainingSlots, triggerImpactMedium],
  );

  const addImage = useCallback(() => {
    triggerImpactLight();

    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
      quality: imageQuality,
      selectionLimit: Math.min(remainingSlots, MAX_SELECTION_LIMIT),
      includeBase64: false,
      includeExtra: false,
    };

    launchImageLibrary(options, handleImagePickerResponse);
  }, [
    imageQuality,
    remainingSlots,
    handleImagePickerResponse,
    triggerImpactLight,
  ]);

  const removeImage = useCallback(
    (indexToRemove: number) => {
      const newImages = images.filter((_, index) => index !== indexToRemove);
      onImagesChange(newImages);
    },
    [images, onImagesChange],
  );

  const generateRandomImage = useCallback(() => {
    triggerImpactLight();

    const randomImageUrl = PicsumUtils.generateSeededUrl({
      width: 400,
      height: 400,
      seed: `recipe-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    });

    const updatedImages = [...images, randomImageUrl];
    onImagesChange(updatedImages);
    ImageCacheManager.preloadImages([randomImageUrl]);
    triggerImpactMedium();
  }, [images, onImagesChange, triggerImpactLight, triggerImpactMedium]);

  const ListHeaderComponent = useMemo(
    () =>
      images.length > 0 ? (
        <AddImageButtons
          onAddFromGallery={addImage}
          onAddRandom={generateRandomImage}
          remainingSlots={remainingSlots}
          hasImages={images.length > 0}
        />
      ) : null,
    [images.length, addImage, generateRandomImage, remainingSlots],
  );

  const ListEmptyComponent = useMemo(
    () => (
      <AddImageButtons
        onAddFromGallery={addImage}
        onAddRandom={generateRandomImage}
        remainingSlots={remainingSlots}
        hasImages={false}
      />
    ),
    [addImage, generateRandomImage, remainingSlots],
  );

  const accessibilityLabel = useMemo(() => {
    return images.length > 0
      ? `Image picker with ${images.length} of ${maxImages} images selected`
      : 'No images added yet';
  }, [images.length, maxImages]);

  return (
    <View style={styles.container}>
      <ImageList
        images={images}
        onRemoveImage={removeImage}
        showDeleteButton={true}
        showErrorFallback={false}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        imageSize={imageSize}
        accessibilityLabel={accessibilityLabel}
        keyPrefix="image-picker"
        snapToInterval={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: IMAGE_SIZE + 20,
  },
});

export default ImagePickerComponent;
