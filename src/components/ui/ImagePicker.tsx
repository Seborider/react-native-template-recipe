import React, { useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  ListRenderItem,
} from 'react-native';
import {
  launchImageLibrary,
  MediaType,
  PhotoQuality,
  ImagePickerResponse,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import { ImageCacheManager } from '../../services/imageCache';
import { PicsumUtils } from '../../utils/picsumUtils';
import { ImageItem } from './ImageItem';
import { AddImageButtons } from './AddImageButtons';
import { ImageSeparator } from '../common/ImageSeparator';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import {
  IMAGE_SIZE,
  IMAGE_SPACING,
  DEFAULT_MAX_IMAGES,
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

const ItemSeparator = () => <ImageSeparator spacing={IMAGE_SPACING} />;

export const ImagePickerComponent: React.FC<ImagePickerProps> = ({
  images,
  onImagesChange,
  maxImages = DEFAULT_MAX_IMAGES,
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

  // Optimized render functions
  const renderImage = useCallback<ListRenderItem<string>>(
    ({ item, index }) => (
      <ImageItem
        uri={item}
        index={index}
        totalImages={images.length}
        onRemove={removeImage}
      />
    ),
    [images.length, removeImage],
  );

  const keyExtractor = useCallback(
    (item: string, index: number) => `image-${index}-${item}`,
    [],
  );

  // Calculate getItemLayout for performance
  const getItemLayout = useCallback(
    (_data: ArrayLike<string> | null | undefined, index: number) => ({
      length: imageSize,
      offset: (imageSize + IMAGE_SPACING) * index,
      index,
    }),
    [imageSize],
  );

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
      <FlatList
        data={images}
        renderItem={renderImage}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparator}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.flatListContent}
        getItemLayout={getItemLayout}
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={5}
        accessibilityRole="list"
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: IMAGE_SIZE + 20,
  },
  flatListContent: {
    paddingVertical: 8,
  },
});

export default ImagePickerComponent;
