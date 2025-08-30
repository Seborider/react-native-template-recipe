import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Platform,
  ListRenderItem,
} from 'react-native';
import { ImageItem } from './ImageItem';
import { ImageModal } from './ImageModal';
import { ImageSeparator } from '../common/ImageSeparator';
import { IMAGE_SIZE, IMAGE_SPACING, SNAP_INTERVAL } from '../../constants';

interface ImageListProps {
  images: string[];
  onRemoveImage?: (index: number) => void;
  showDeleteButton?: boolean;
  showErrorFallback?: boolean;
  ListHeaderComponent?:
    | React.ComponentType<unknown>
    | React.ReactElement
    | null;
  ListEmptyComponent?: React.ComponentType<unknown> | React.ReactElement | null;
  imageSize?: number;
  accessibilityLabel?: string;
  scrollEnabled?: boolean;
  snapToInterval?: boolean;
  keyPrefix?: string;
  onScrollBeginDrag?: () => void;
  onScrollEndDrag?: () => void;
  onMomentumScrollEnd?: () => void;
}

const ItemSeparator = () => <ImageSeparator spacing={IMAGE_SPACING} />;

export const ImageList: React.FC<ImageListProps> = ({
  images,
  onRemoveImage,
  showDeleteButton = true,
  showErrorFallback = false,
  ListHeaderComponent,
  ListEmptyComponent,
  imageSize = IMAGE_SIZE,
  accessibilityLabel,
  scrollEnabled = true,
  snapToInterval = false,
  keyPrefix = 'image',
  onScrollBeginDrag,
  onScrollEndDrag,
  onMomentumScrollEnd,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleImagePress = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleIndexChange = useCallback((newIndex: number) => {
    setSelectedImageIndex(newIndex);
  }, []);

  const renderImage = useCallback<ListRenderItem<string>>(
    ({ item, index }) => (
      <ImageItem
        uri={item}
        index={index}
        totalImages={images.length}
        onRemove={onRemoveImage}
        showDeleteButton={showDeleteButton}
        showErrorFallback={showErrorFallback}
        onPress={() => handleImagePress(index)}
      />
    ),
    [
      images.length,
      onRemoveImage,
      showDeleteButton,
      showErrorFallback,
      handleImagePress,
    ],
  );
  const keyExtractor = useCallback(
    (item: string, index: number) => `${keyPrefix}-${index}-${item}`,
    [keyPrefix],
  );

  const getItemLayout = useCallback(
    (_data: ArrayLike<string> | null | undefined, index: number) => ({
      length: imageSize,
      offset: (imageSize + IMAGE_SPACING) * index,
      index,
    }),
    [imageSize],
  );

  const defaultAccessibilityLabel = useMemo(() => {
    return images.length > 0
      ? `Image list with ${images.length} ${
          images.length === 1 ? 'image' : 'images'
        }`
      : 'No images in list';
  }, [images.length]);

  const flatListProps = useMemo(() => {
    return {
      data: images,
      renderItem: renderImage,
      keyExtractor,
      horizontal: true,
      showsHorizontalScrollIndicator: false,
      ItemSeparatorComponent: ItemSeparator,
      ListHeaderComponent,
      ListEmptyComponent,
      contentContainerStyle: styles.flatListContent,
      getItemLayout,
      removeClippedSubviews: Platform.OS === 'android',
      maxToRenderPerBatch: 5,
      windowSize: 10,
      initialNumToRender: snapToInterval ? 3 : 5,
      accessibilityRole: 'list' as const,
      accessibilityLabel: accessibilityLabel || defaultAccessibilityLabel,
      scrollEnabled,
      ...(snapToInterval && {
        decelerationRate: 'fast' as const,
        snapToInterval: SNAP_INTERVAL,
        snapToAlignment: 'start' as const,
        onScrollBeginDrag,
        onScrollEndDrag,
        onMomentumScrollEnd,
      }),
    };
  }, [
    images,
    renderImage,
    keyExtractor,
    ListHeaderComponent,
    ListEmptyComponent,
    getItemLayout,
    accessibilityLabel,
    defaultAccessibilityLabel,
    scrollEnabled,
    snapToInterval,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollEnd,
  ]);

  return (
    <View style={{ minHeight: imageSize + 20 }}>
      <FlatList {...flatListProps} />
      {modalVisible && (
        <ImageModal
          visible={modalVisible}
          images={images}
          index={selectedImageIndex}
          onClose={handleCloseModal}
          onIndexChange={handleIndexChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flatListContent: {
    paddingVertical: 8,
  },
});

export default ImageList;
