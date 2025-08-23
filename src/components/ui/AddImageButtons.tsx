import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '../common/Button';
import { IMAGE_SIZE, IMAGE_SPACING } from '../../constants';

export interface AddImageButtonsProps {
  onAddFromGallery: () => void;
  onAddRandom: () => void;
  remainingSlots: number;
  hasImages: boolean;
}

export const AddImageButtons = memo<AddImageButtonsProps>(
  ({ onAddFromGallery, onAddRandom, remainingSlots, hasImages }) => (
    <View
      style={[
        styles.addButtonContainer,
        hasImages && styles.addButtonWithMargin,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Add image options">
      <Button
        icon="+"
        title="Gallery"
        variant="imageAdd"
        size="small"
        onPress={onAddFromGallery}
        style={styles.addButton}
        disabled={remainingSlots === 0}
        accessibilityLabel="Add image from gallery"
        accessibilityHint={`Add ${
          hasImages ? 'another' : 'your first'
        } image from your photo library. ${remainingSlots} slots remaining`}
      />
      <Button
        icon="🎲"
        title="Random"
        variant="imageAdd"
        size="small"
        onPress={onAddRandom}
        disabled={remainingSlots === 0}
        accessibilityLabel="Add random image"
        accessibilityHint={`Add ${
          hasImages ? 'another' : 'your first'
        } random placeholder image. ${remainingSlots} slots remaining`}
      />
    </View>
  ),
);

AddImageButtons.displayName = 'AddImageButtons';

const styles = StyleSheet.create({
  addButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  addButtonWithMargin: {
    marginRight: IMAGE_SPACING,
  },
  addButton: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
  },
});
