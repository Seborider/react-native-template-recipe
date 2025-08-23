import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Text, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Recipe } from '../types/Recipe';
import { getRecipes, deleteRecipe } from '../services/storage';
import { RecipeCard } from '../components/ui/RecipeCard';
import { Button } from '../components/common/Button';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import {
  RootStackParamList,
  SerializableRecipe,
} from '../navigation/AppNavigator';

type RecipeListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RecipeList'
>;

interface Props {
  navigation: RecipeListScreenNavigationProp;
}

const HeaderRightButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <Button
    title="+"
    variant="primary"
    size="small"
    onPress={onPress}
    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
    accessibilityLabel="Add new recipe"
    accessibilityHint="Opens form to create a new recipe"
  />
);

export const RecipeListScreen: React.FC<Props> = ({ navigation }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    triggerImpactLight,
    triggerImpactMedium,
    triggerNotificationSuccess,
    triggerNotificationError,
  } = useHapticFeedback();

  const loadRecipes = async () => {
    try {
      const loadedRecipes = await getRecipes();
      // Sort recipes by creation date (newest first)
      const sortedRecipes = loadedRecipes.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setRecipes(sortedRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToAddRecipe = useCallback(() => {
    triggerImpactMedium();
    navigation.navigate('AddRecipe', {});
  }, [navigation, triggerImpactMedium]);

  const headerRight = useCallback(
    () => <HeaderRightButton onPress={navigateToAddRecipe} />,
    [navigateToAddRecipe],
  );

  const handleRecipePress = (recipe: Recipe) => {
    triggerImpactLight();
    // In the future, this could navigate to a recipe detail screen
    // For now, it could navigate to edit mode

    // Convert Recipe to SerializableRecipe for navigation
    const serializableRecipe: SerializableRecipe = {
      ...recipe,
      createdAt: recipe.createdAt.toISOString(),
      updatedAt: recipe.updatedAt.toISOString(),
    };

    navigation.navigate('AddRecipe', { recipe: serializableRecipe });
  };

  const handleDeleteRecipe = async (recipe: Recipe) => {
    try {
      await deleteRecipe(recipe.id);
      triggerNotificationSuccess();
      // Reload the recipes to reflect the deletion
      await loadRecipes();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      triggerNotificationError();
      Alert.alert(
        'Delete Error',
        'There was a problem deleting the recipe. Please try again.',
      );
    }
  };

  // Reload recipes when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, []),
  );

  useEffect(() => {
    // Set up the header right button
    navigation.setOptions({
      headerRight,
    });
  }, [navigation, headerRight]);

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <RecipeCard
      recipe={item}
      onPress={() => handleRecipePress(item)}
      onDelete={handleDeleteRecipe}
    />
  );

  const renderEmptyState = () => (
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

  const renderSeparator = () => <View style={styles.separator} />;

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
    <View style={styles.container}>
      <FlatList
        data={recipes}
        renderItem={renderRecipe}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          recipes.length === 0 && styles.emptyListContent,
        ]}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        accessibilityRole="list"
        accessibilityLabel={`Recipe list with ${recipes.length} ${
          recipes.length === 1 ? 'recipe' : 'recipes'
        }`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  listContent: {
    paddingVertical: 16,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  separator: {
    height: 8,
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
