import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

import { FormInput } from '../components/common/FormInput';
import { RootStackParamList } from '../navigation/AppNavigator';

type AddRecipeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddRecipe'
>;

type AddRecipeScreenRouteProp = RouteProp<RootStackParamList, 'AddRecipe'>;

interface Props {
  navigation: AddRecipeScreenNavigationProp;
  route: AddRecipeScreenRouteProp;
}

export const AddRecipeScreen: React.FC<Props> = () => {
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <FormInput
              label="Title"
              value={''}
              onChangeText={() => console.log('text')}
              placeholder="Enter recipe title"
              required
              showRequiredFieldsHint
              autoCapitalize="words"
              returnKeyType="next"
              accessibilityHint="Required field. Enter a name for your recipe"
            />

            <FormInput
              label="Description"
              value={''}
              onChangeText={() => console.log('text')}
              placeholder="Describe your recipe..."
              multiline
              numberOfLines={4}
              autoCapitalize="sentences"
              showCharacterCount
              accessibilityHint="Optional field. Provide details about your recipe"
            />
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
});
