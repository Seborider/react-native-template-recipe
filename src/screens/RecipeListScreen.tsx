import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/common/Button';

import { RootStackParamList } from '../navigation/AppNavigator';

type RecipeListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RecipeList'
>;

interface Props {
  navigation: RecipeListScreenNavigationProp;
}

export const RecipeListScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, _setLoading] = useState(true);

  const navigateToAddRecipe = useCallback(() => {
    navigation.navigate('AddRecipe', {});
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View
          style={styles.loadingContainer}
          accessibilityRole="progressbar"
          accessibilityLabel="Loading recipes">
          <Text style={styles.loadingText} accessibilityLiveRegion="polite">
            Loading recipes...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Recipes Yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to add your first recipe
      </Text>
      <Button
        title="Add Recipe"
        variant="primary"
        size="medium"
        onPress={navigateToAddRecipe}
        accessibilityLabel="Add your first recipe"
        accessibilityHint="Opens form to create your first recipe"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
});
