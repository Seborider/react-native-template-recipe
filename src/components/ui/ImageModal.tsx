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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ImageModalProps {
  visible: boolean;
  uri: string;
  index: number;
  totalImages: number;
  onClose: () => void;
}

const ImageModal = memo<ImageModalProps>(
  ({ visible, uri, index, totalImages, onClose }) => {
    const { triggerImpactLight } = useHapticFeedback();
    const { colors } = useThemeColors();
    const [hasError, setHasError] = useState(false);

    // Animation setup for swipe-to-close gesture
    const pan = useRef(new Animated.ValueXY()).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dy) > 10;
        },
        onPanResponderMove: (_, gestureState) => {
          pan.setValue({ x: 0, y: gestureState.dy });
          const progress = Math.abs(gestureState.dy) / (screenHeight * 0.3);
          opacity.setValue(Math.max(0.3, 1 - progress));
        },
        onPanResponderRelease: (_, gestureState) => {
          if (Math.abs(gestureState.dy) > screenHeight * 0.15) {
            // Close modal if dragged far enough
            handleClose();
          } else {
            // Snap back to original position
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
          }
        },
      }),
    ).current;

    const handleClose = useCallback(() => {
      triggerImpactLight();
      // Reset animation values
      pan.setValue({ x: 0, y: 0 });
      opacity.setValue(1);
      onClose();
    }, [onClose, triggerImpactLight, pan, opacity]);

    const handleImageError = useCallback(() => {
      console.warn(`Failed to load image ${index + 1} in modal:`, uri);
      setHasError(true);
    }, [index, uri]);

    const imageConfig = useMemo(() => getImageConfigForUri(uri), [uri]);
    const imageSource = useMemo(
      () => createImageSource(uri, imageConfig),
      [uri, imageConfig],
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
          ]}
          {...panResponder.panHandlers}>
          <FastImage
            source={imageSource}
            style={styles.image}
            resizeMode="contain"
            onError={handleImageError}
            accessibilityRole="image"
            accessibilityLabel={`Recipe image ${
              index + 1
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
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Close modal backdrop"
            accessibilityHint="Tap to close the full screen image view">
            <View style={styles.content}>
              {/* Header with close button and image counter */}
              <View style={styles.header}>
                <Text style={styles.counter}>
                  {index + 1} / {totalImages}
                </Text>
                <Button
                  icon="×"
                  variant="primary"
                  size="medium"
                  onPress={handleClose}
                  style={styles.closeButton}
                  textStyle={styles.closeIcon}
                  hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
                  accessibilityLabel="Close button"
                  accessibilityHint="Tap to close the full screen image view"
                />
              </View>

              {/* Image content */}
              {renderContent()}

              {/* Footer hint */}
              <View style={styles.footer}>
                <Text style={styles.hintText}>Swipe down or tap to close</Text>
              </View>
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    );
  },
);

ImageModal.displayName = 'ImageModal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  closeIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    color: '#FFFFFF',
  },
});

export { ImageModal };
export type { ImageModalProps };
