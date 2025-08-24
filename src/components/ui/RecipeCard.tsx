import React, { useRef, useState, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ListRenderItem,
} from 'react-native';
import ReanimatedSwipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SharedValue } from 'react-native-reanimated';
import { Recipe } from '../../types/Recipe';
import { ImageSeparator } from '../common/ImageSeparator';
import { ImageItem } from './ImageItem';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import {
  IMAGE_SIZE,
  SWIPE_THRESHOLD,
  SWIPE_FRICTION,
  SNAP_INTERVAL,
} from '../../constants';
import { AnimatedDeleteButton } from './AnimatedDeleteButton';

interface RecipeCardProps {
  recipe: Recipe;
  onPress?: () => void;
  onDelete: (recipe: Recipe) => void;
}

// Memoized Components
const EmptyImages = memo(() => (
  <View
    style={styles.emptyImagesContainer}
    accessibilityRole="text"
    accessibilityLabel="No images added to this recipe">
    <Text style={styles.emptyImagesText}>No images</Text>
  </View>
));
EmptyImages.displayName = 'EmptyImages';

// Utility functions
const showDeleteConfirmation = (
  recipe: Recipe,
  onConfirm: () => void,
  onCancel: () => void,
): void => {
  Alert.alert(
    'Delete Recipe',
    `Are you sure you want to delete "${recipe.title}"? This action cannot be undone.`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: onConfirm,
      },
    ],
  );
};

export const RecipeCard = memo<RecipeCardProps>(
  ({ recipe, onPress, onDelete }) => {
    const swipeableRef = useRef<SwipeableMethods>(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const { triggerImpactMedium, triggerNotificationWarning } =
      useHapticFeedback();

    const handleDelete = useCallback(() => {
      triggerImpactMedium();

      showDeleteConfirmation(
        recipe,
        () => {
          triggerNotificationWarning();
          onDelete(recipe);
        },
        () => {
          swipeableRef.current?.close();
        },
      );
    }, [recipe, onDelete, triggerImpactMedium, triggerNotificationWarning]);

    const renderRightActions = useCallback(
      (progress: SharedValue<number>) => (
        <View style={styles.rightActionContainer}>
          <AnimatedDeleteButton progress={progress} onPress={handleDelete} />
        </View>
      ),
      [handleDelete],
    );

    const renderImage: ListRenderItem<string> = useCallback(
      ({ item, index }) => (
        <ImageItem
          uri={item}
          index={index}
          totalImages={recipe.images.length}
          showDeleteButton={false}
          showErrorFallback={true}
        />
      ),
      [recipe.images.length],
    );

    const keyExtractor = useCallback(
      (_item: string, index: number) => `${recipe.id}-image-${index}`,
      [recipe.id],
    );

    const handleScrollBegin = useCallback(() => {
      setIsScrolling(true);
    }, []);

    const handleScrollEnd = useCallback(() => {
      setIsScrolling(false);
    }, []);

    const handleCardPress = useCallback(() => {
      onPress?.();
    }, [onPress]);

    const flatListProps = useMemo(
      () => ({
        data: recipe.images,
        renderItem: renderImage,
        keyExtractor,
        horizontal: true,
        showsHorizontalScrollIndicator: false,
        ItemSeparatorComponent: ImageSeparator,
        contentContainerStyle: styles.imagesList,
        decelerationRate: 'fast' as const,
        snapToInterval: SNAP_INTERVAL,
        snapToAlignment: 'start' as const,
        onScrollBeginDrag: handleScrollBegin,
        onScrollEndDrag: handleScrollEnd,
        onMomentumScrollEnd: handleScrollEnd,
        removeClippedSubviews: true,
        maxToRenderPerBatch: 5,
        windowSize: 10,
        initialNumToRender: 3,
        accessibilityRole: 'list' as const,
        accessibilityLabel: `${recipe.images.length} recipe ${
          recipe.images.length === 1 ? 'image' : 'images'
        }`,
      }),
      [
        recipe.images,
        renderImage,
        keyExtractor,
        handleScrollBegin,
        handleScrollEnd,
      ],
    );

    const accessibilityValue = useMemo(
      () => ({
        text: `${recipe.title}. ${
          recipe.description
            ? recipe.description.substring(0, 100)
            : 'No description'
        }. Swipe right to delete.`,
      }),
      [recipe.title, recipe.description],
    );

    return (
      <ReanimatedSwipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        rightThreshold={SWIPE_THRESHOLD}
        friction={SWIPE_FRICTION}
        enabled={!isScrolling}>
        <View
          style={styles.card}
          accessibilityRole="text"
          accessibilityLabel={`Recipe card for ${recipe.title}`}
          accessibilityValue={accessibilityValue}>
          <View style={styles.cardContent}>
            <TouchableOpacity
              style={styles.textContainer}
              onPress={handleCardPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Recipe: ${recipe.title}`}
              accessibilityHint={`Tap to edit recipe. ${
                recipe.description
                  ? recipe.description.substring(0, 100)
                  : 'No description'
              }`}>
              <Text
                style={styles.title}
                numberOfLines={2}
                accessibilityRole="header">
                {recipe.title}
              </Text>
              <Text
                style={styles.description}
                numberOfLines={3}
                accessibilityRole="text">
                {recipe.description || 'No description provided'}
              </Text>
            </TouchableOpacity>

            <View style={styles.imagesSection}>
              {recipe.images.length > 0 ? (
                <FlatList {...flatListProps} />
              ) : (
                <EmptyImages />
              )}
            </View>
          </View>
        </View>
      </ReanimatedSwipeable>
    );
  },
);

RecipeCard.displayName = 'RecipeCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  textContainer: {
    marginBottom: 12,
    paddingVertical: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 0,
  },
  imagesSection: {
    minHeight: IMAGE_SIZE,
  },
  imagesList: {
    paddingVertical: 4,
  },
  emptyImagesContainer: {
    height: IMAGE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  emptyImagesText: {
    fontSize: 14,
    color: '#999999',
  },
  rightActionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    marginVertical: 8,
  },
});
