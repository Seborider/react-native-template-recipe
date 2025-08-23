import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Recipe } from '../types/Recipe';
import {
  saveRecipe as saveRecipeToStorage,
  updateRecipe as updateRecipeInStorage,
} from '../services/storage';
import { ImagePickerComponent } from '../components/ui/ImagePicker';
import { Button } from '../components/common/Button';
import { FormInput } from '../components/common/FormInput';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  useRecipeForm,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_IMAGES,
} from '../hooks/useRecipeForm';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import {
  KEYBOARD_VERTICAL_OFFSET_IOS,
  KEYBOARD_VERTICAL_OFFSET_ANDROID,
} from '../constants';

type AddRecipeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddRecipe'
>;

type AddRecipeScreenRouteProp = RouteProp<RootStackParamList, 'AddRecipe'>;

interface Props {
  navigation: AddRecipeScreenNavigationProp;
  route: AddRecipeScreenRouteProp;
}

interface HeaderButtonProps {
  onPress: () => void;
}

const HeaderLeftButton = memo<HeaderButtonProps>(({ onPress }) => (
  <Button
    title="Cancel"
    variant="ghost"
    size="small"
    onPress={onPress}
    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
    accessibilityLabel="Cancel recipe creation"
    accessibilityHint="Discards changes and returns to recipe list"
  />
));

HeaderLeftButton.displayName = 'HeaderLeftButton';

interface HeaderRightButtonProps extends HeaderButtonProps {
  saving: boolean;
}

const HeaderRightButton = memo<HeaderRightButtonProps>(
  ({ onPress, saving }) => (
    <Button
      title={saving ? 'Saving...' : 'Done'}
      variant="primary"
      size="small"
      onPress={onPress}
      disabled={saving}
      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      accessibilityLabel={saving ? 'Saving recipe' : 'Save recipe'}
      accessibilityHint={
        saving
          ? 'Recipe is being saved'
          : 'Saves the recipe and returns to recipe list'
      }
    />
  ),
);

HeaderRightButton.displayName = 'HeaderRightButton';

export const AddRecipeScreen: React.FC<Props> = ({ navigation, route }) => {
  const {
    triggerImpactLight,
    triggerImpactMedium,
    triggerNotificationSuccess,
    triggerNotificationError,
  } = useHapticFeedback();

  const existingRecipe: Recipe | undefined = useMemo(() => {
    const serializableRecipe = route.params?.recipe;
    if (!serializableRecipe) {
      return undefined;
    }

    try {
      return {
        ...serializableRecipe,
        createdAt: new Date(serializableRecipe.createdAt),
        updatedAt: new Date(serializableRecipe.updatedAt),
      };
    } catch (error) {
      console.error('Error parsing recipe dates:', error);
      return {
        ...serializableRecipe,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }, [route.params?.recipe]);

  const isEditing = !!existingRecipe;

  const {
    title,
    setTitle,
    description,
    setDescription,
    images,
    setImages,
    hasChanges,
    validate,
    getRecipeData,
  } = useRecipeForm(existingRecipe);
  const [saving, setSaving] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);

  // Prevent double-tap on save
  const saveRecipe = useCallback(async () => {
    if (saving || saveAttempted) {
      return;
    }

    const validation = validate();
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    setSaving(true);
    setSaveAttempted(true);
    triggerImpactLight();

    try {
      const recipe = getRecipeData();

      if (isEditing) {
        await updateRecipeInStorage(recipe);
      } else {
        await saveRecipeToStorage(recipe);
      }

      triggerNotificationSuccess();
      navigation.goBack();
    } catch (error) {
      console.error('Error saving recipe:', error);
      triggerNotificationError();

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'There was a problem saving your recipe. Please try again.';

      Alert.alert('Save Error', errorMessage);
      setSaveAttempted(false);
    } finally {
      setSaving(false);
    }
  }, [
    saving,
    saveAttempted,
    validate,
    getRecipeData,
    isEditing,
    navigation,
    triggerImpactLight,
    triggerNotificationSuccess,
    triggerNotificationError,
  ]);

  const handleCancel = useCallback(() => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          {
            text: 'Keep Editing',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              triggerImpactMedium();
              navigation.goBack();
            },
          },
        ],
      );
    } else {
      navigation.goBack();
    }
  }, [hasChanges, navigation, triggerImpactMedium]);

  // Memoize header components to prevent recreation on each render
  const headerLeft = useMemo(
    () => <HeaderLeftButton onPress={handleCancel} />,
    [handleCancel],
  );

  const headerRight = useMemo(
    () => <HeaderRightButton onPress={saveRecipe} saving={saving} />,
    [saveRecipe, saving],
  );

  // Set up navigation header once
  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Recipe' : 'Add Recipe',
      headerLeft: () => headerLeft,
      headerRight: () => headerRight,
    });
  }, [navigation, isEditing, headerLeft, headerRight]);

  const keyboardVerticalOffset = Platform.select({
    ios: KEYBOARD_VERTICAL_OFFSET_IOS,
    android: KEYBOARD_VERTICAL_OFFSET_ANDROID,
    default: 0,
  });

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardVerticalOffset}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <FormInput
              label="Title"
              value={title}
              onChangeText={setTitle}
              placeholder="Enter recipe title"
              required
              showRequiredFieldsHint
              autoCapitalize="words"
              returnKeyType="next"
              maxLength={MAX_TITLE_LENGTH}
              accessibilityHint="Required field. Enter a name for your recipe"
            />

            <FormInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your recipe..."
              multiline
              numberOfLines={4}
              autoCapitalize="sentences"
              maxLength={MAX_DESCRIPTION_LENGTH}
              showCharacterCount
              accessibilityHint="Optional field. Provide details about your recipe"
            />

            <View style={styles.inputSection}>
              <Text
                style={styles.label}
                accessibilityRole="text"
                nativeID="images-label">
                Images
              </Text>
              <View
                style={styles.imagePickerContainer}
                accessibilityRole="none"
                accessibilityLabel="Recipe images section"
                accessibilityHint={`Add up to ${MAX_IMAGES} images for your recipe`}>
                <ImagePickerComponent
                  images={images}
                  onImagesChange={setImages}
                  maxImages={MAX_IMAGES}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  form: {
    padding: 16,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  imagePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 120,
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});
