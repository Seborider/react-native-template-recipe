import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import Reanimated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Button } from '../common/Button';

interface AnimatedDeleteButtonProps {
  progress: SharedValue<number>;
  onPress: () => void;
}

export const AnimatedDeleteButton = memo<AnimatedDeleteButtonProps>(
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

const styles = StyleSheet.create({
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
});
