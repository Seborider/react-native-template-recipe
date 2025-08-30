import React, { memo, useCallback, useRef, useState, useMemo } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform,
  Text,
  PanResponder,
  Animated,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { Button } from '../common/Button';
import {
  createImageSource,
  getImageConfigForUri,
} from '../../services/imageCache';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { useThemeColors } from '../../hooks/useThemeColors';
import { COLORS } from '../../constants/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ImageModalProps {
  visible: boolean;
  images: string[];
  index: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

const ImageModal = memo<ImageModalProps>(
  ({ visible, images, index, onClose, onIndexChange }) => {
    const { triggerImpactLight } = useHapticFeedback();
    const { colors } = useThemeColors();
    const [hasError, setHasError] = useState(false);

    const styles = useMemo(() => createStyles(colors), [colors]);

    const currentIndex = index;
    const currentUri = images[currentIndex] || '';
    const totalImages = images.length;

    // Animation setup for swipe gestures
    const pan = useRef(new Animated.ValueXY()).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const navigateToImage = useCallback(
      (newIndex: number) => {
        // Ensure the new index is within valid bounds
        if (
          newIndex >= 0 &&
          newIndex < totalImages &&
          newIndex !== currentIndex
        ) {
          onIndexChange?.(newIndex);
          triggerImpactLight();
        }
      },
      [totalImages, currentIndex, onIndexChange, triggerImpactLight],
    );

    const handleClose = useCallback(() => {
      triggerImpactLight();
      // Reset animation values
      pan.setValue({ x: 0, y: 0 });
      opacity.setValue(1);
      onClose();
    }, [onClose, triggerImpactLight, pan, opacity]);

    const panResponder = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => {
            return true;
          },
          onMoveShouldSetPanResponder: (_, gestureState) => {
            return (
              Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10
            );
          },
          onPanResponderGrant: () => {
            // Store the initial touch position
          },
          onPanResponderMove: (_, gestureState) => {
            // Handle vertical swipe to close
            if (Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
              pan.setValue({ x: 0, y: gestureState.dy });
              const progress = Math.abs(gestureState.dy) / (screenHeight * 0.3);
              opacity.setValue(Math.max(0.3, 1 - progress));
            } else {
              // Handle horizontal swipe for navigation
              pan.setValue({ x: gestureState.dx, y: 0 });
              const progress = Math.abs(gestureState.dx) / (screenWidth * 0.3);
              opacity.setValue(Math.max(0.7, 1 - progress * 0.3));
            }
          },
          onPanResponderRelease: (_, gestureState) => {
            // Check if it was just a tap (small movement)
            const isJustATap =
              Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10;

            if (isJustATap) {
              // Handle tap to close
              handleClose();
              return;
            }

            const isVerticalSwipe =
              Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
            if (isVerticalSwipe) {
              // Vertical swipe - close modal if far enough
              if (Math.abs(gestureState.dy) > screenHeight * 0.15) {
                handleClose();
                return;
              }
            } else {
              // Horizontal swipe - navigate between images
              const swipeThreshold = screenWidth * 0.2;

              // Use current values directly from closure
              // Swipe RIGHT (positive dx) = go to PREVIOUS image (lower index)
              if (gestureState.dx > swipeThreshold && currentIndex > 0) {
                onIndexChange?.(currentIndex - 1);
                triggerImpactLight();
              }
              // Swipe LEFT (negative dx) = go to NEXT image (higher index)
              else if (
                gestureState.dx < -swipeThreshold &&
                currentIndex < totalImages - 1
              ) {
                onIndexChange?.(currentIndex + 1);
                triggerImpactLight();
              }
            }

            // Reset pan position
            Animated.parallel([
              Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: true,
              }),
              Animated.spring(opacity, {
                toValue: 1,
                useNativeDriver: true,
              }),
            ]).start();
          },
        }),
      [
        currentIndex,
        totalImages,
        onIndexChange,
        triggerImpactLight,
        handleClose,
        pan,
        opacity,
      ],
    );

    const handleImageError = useCallback(() => {
      setHasError(true);
    }, []);

    const imageConfig = useMemo(
      () => getImageConfigForUri(currentUri),
      [currentUri],
    );
    const imageSource = useMemo(
      () => createImageSource(currentUri, imageConfig),
      [currentUri, imageConfig],
    );

    const renderContent = () => {
      if (!imageSource || hasError) {
        return (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>📷</Text>
            <Text style={[styles.errorSubtext, { color: colors.darkGray }]}>
              Image not available
            </Text>
          </View>
        );
      }

      return (
        <Animated.View
          style={[
            styles.imageContainer,
            {
              transform: pan.getTranslateTransform(),
              opacity: opacity,
            },
          ]}>
          <FastImage
            key={currentUri} // Force re-mount when URI changes, automatically resets error state
            source={imageSource}
            style={styles.image}
            resizeMode="contain"
            onError={handleImageError}
            accessibilityRole="image"
            accessibilityLabel={`Recipe image ${
              currentIndex + 1
            } of ${totalImages} in full screen view`}
            accessibilityIgnoresInvertColors={true}
          />
        </Animated.View>
      );
    };

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={handleClose}
        accessibilityViewIsModal={true}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <SafeAreaView style={styles.container}>
          <View style={styles.backdrop} {...panResponder.panHandlers}>
            <View style={styles.content}>
              {/* Header with close button and image counter */}
              <View style={styles.header}>
                <Text style={[styles.counter, { color: colors.lightGray }]}>
                  {currentIndex + 1} / {totalImages}
                </Text>
                <Button
                  icon="×"
                  variant="primary"
                  size="small"
                  onPress={handleClose}
                  style={styles.closeButton}
                  textStyle={{
                    ...styles.closeIcon,
                    color: colors.lightGray,
                  }}
                  hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
                  accessibilityLabel="Close button"
                  accessibilityHint="Tap to close the full screen image view"
                />
              </View>

              {/* Image content */}
              {renderContent()}

              {/* Navigation arrows */}
              {totalImages > 1 && (
                <>
                  {currentIndex > 0 && (
                    <TouchableOpacity
                      style={[styles.navButton, styles.navButtonLeft]}
                      onPress={() => navigateToImage(currentIndex - 1)}
                      accessibilityRole="button"
                      accessibilityLabel="Previous image"
                      accessibilityHint="Navigate to the previous image">
                      <Text
                        style={[
                          styles.navButtonText,
                          { color: colors.lightGray },
                        ]}>
                        ‹
                      </Text>
                    </TouchableOpacity>
                  )}
                  {currentIndex < totalImages - 1 && (
                    <TouchableOpacity
                      style={[styles.navButton, styles.navButtonRight]}
                      onPress={() => navigateToImage(currentIndex + 1)}
                      accessibilityRole="button"
                      accessibilityLabel="Next image"
                      accessibilityHint="Navigate to the next image">
                      <Text
                        style={[
                          styles.navButtonText,
                          { color: colors.lightGray },
                        ]}>
                        ›
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              {/* Footer hint */}
              <View style={styles.footer}>
                <Text style={[styles.hintText, { color: colors.lightGray }]}>
                  {totalImages > 1
                    ? 'Swipe left/right to navigate • Swipe down or tap to close'
                    : 'Swipe down or tap to close'}
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  },
);

ImageModal.displayName = 'ImageModal';

const createStyles = (colors: typeof COLORS.light | typeof COLORS.dark) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    backdrop: {
      flex: 1,
      backgroundColor:
        colors.background === '#FFFFFF'
          ? 'rgba(0, 0, 0, 0.9)'
          : 'rgba(0, 0, 0, 0.95)',
    },
    content: {
      flex: 1,
      justifyContent: 'space-between',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? 10 : 30,
      paddingBottom: 10,
      zIndex: 1,
    },
    counter: {
      fontSize: 16,
      fontWeight: '600',
    },
    closeButton: {
      backgroundColor:
        colors.background === '#FFFFFF'
          ? 'rgba(0, 0, 0, 0.5)'
          : 'rgba(255, 255, 255, 0.2)',
      borderRadius: 20,
      width: 40,
      height: 40,
    },
    closeIcon: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    imageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    image: {
      width: screenWidth - 40,
      height: screenHeight * 0.7,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    errorText: {
      fontSize: 64,
      marginBottom: 16,
      opacity: 0.6,
    },
    errorSubtext: {
      fontSize: 16,
      textAlign: 'center',
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === 'ios' ? 30 : 20,
      alignItems: 'center',
    },
    hintText: {
      fontSize: 14,
      opacity: 0.7,
      textAlign: 'center',
    },
    navButton: {
      position: 'absolute',
      top: '50%',
      marginTop: -30,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor:
        colors.background === '#FFFFFF'
          ? 'rgba(0, 0, 0, 0.5)'
          : 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
    },
    navButtonLeft: {
      left: 20,
    },
    navButtonRight: {
      right: 20,
    },
    navButtonText: {
      fontSize: 30,
      fontWeight: 'bold',
      lineHeight: 30,
    },
  });

export { ImageModal };
export type { ImageModalProps };
