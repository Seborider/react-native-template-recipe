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
import FastImage from 'react-native-fast-image';
import ReanimatedSwipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Recipe } from '../../types/Recipe';
import { Button } from '../common/Button';
import { ImageSeparator } from '../common/ImageSeparator';
import {
  createImageSource,
  getImageConfigForUri,
} from '../../services/imageCache';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import {
  IMAGE_SIZE,
  DEFAULT_SPACING,
  SWIPE_THRESHOLD,
  SWIPE_FRICTION,
} from '../../constants';

const SNAP_INTERVAL = IMAGE_SIZE + DEFAULT_SPACING;

interface RecipeCardProps {
  recipe: Recipe;
  onPress?: () => void;
  onDelete: (recipe: Recipe) => void;
}

interface AnimatedDeleteButtonProps {
  progress: SharedValue<number>;
  onPress: () => void;
}

interface RecipeImageProps {
  uri: string;
  index: number;
  total: number;
}

// Memoized Components
const AnimatedDeleteButton = memo<AnimatedDeleteButtonProps>(
  ({ progress, onPress }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(progress.value, [0, 0.6], [0, 1], 'clamp');
      const opacity = interpolate(
        progress.value,
        [0, 0.3, 0.7],
        [0, 0.8, 1],
        'clamp',
      );

      return {
        transform: [{ scale }],
        opacity,
      };
    });

    return (
      <Reanimated.View style={[styles.deleteButton, animatedStyle]}>
        <Button
          icon="🗑️"
          title="Delete"
          variant="delete"
          size="small"
          onPress={onPress}
          style={styles.deleteButtonTouch}
          accessibilityLabel="Delete recipe"
          accessibilityHint="Double tap to confirm deletion"
        />
      </Reanimated.View>
    );
  },
);
AnimatedDeleteButton.displayName = 'AnimatedDeleteButton';

const RecipeImage = memo<RecipeImageProps>(({ uri, index, total }) => {
  const [hasError, setHasError] = useState(false);

  const handleImageError = useCallback(() => {
    console.warn(`Failed to load image ${index + 1}:`, uri);
    setHasError(true);
  }, [index, uri]);

  const imageConfig = useMemo(() => getImageConfigForUri(uri), [uri]);
  const imageSource = useMemo(
    () => createImageSource(uri, imageConfig),
    [uri, imageConfig],
  );

  if (hasError || !imageSource) {
    return (
      <View style={[styles.imageContainer, styles.imagePlaceholder]}>
        <Text style={styles.imagePlaceholderText}>📷</Text>
      </View>
    );
  }

  return (
    <View style={styles.imageContainer}>
      <FastImage
        source={imageSource}
        style={styles.image}
        onError={handleImageError}
        accessibilityRole="image"
        accessibilityLabel={`Recipe image ${index + 1} of ${total}`}
        accessibilityIgnoresInvertColors={true}
        resizeMode={imageConfig.resizeMode}
      />
    </View>
  );
});
RecipeImage.displayName = 'RecipeImage';

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
        <RecipeImage uri={item} index={index} total={recipe.images.length} />
      ),
      [recipe.images.length],
    );

    const keyExtractor = useCallback(
      (item: string, index: number) => `${recipe.id}-image-${index}`,
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
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    backgroundColor: '#F0F0F0',
  },
  imagePlaceholder: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 24,
    opacity: 0.5,
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
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonTouch: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  deleteButtonText: {
    fontSize: 24,
    marginBottom: 4,
  },
  deleteButtonLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
