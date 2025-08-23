import React, { memo, useMemo } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';

import { Recipe } from '../types/Recipe';
import { RecipeListScreen } from '../screens/RecipeListScreen';
import { AddRecipeScreen } from '../screens/AddRecipeScreen';
import { COLORS } from '../constants';

export type SerializableRecipe = Omit<Recipe, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type RootStackParamList = {
  RecipeList: undefined;
  AddRecipe: { recipe?: SerializableRecipe };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const SCREEN_OPTIONS = {
  recipeList: {
    title: 'Your Recipes',
    headerLargeTitle: true,
    headerLargeTitleStyle: {
      fontWeight: '700',
    },
  },
  addRecipe: {
    title: 'Add Recipe',
    presentation: 'modal' as const,
    gestureEnabled: true,
    gestureDirection: 'vertical' as const,
  },
} as const;

export const AppNavigator = memo(() => {
  const colorScheme = useColorScheme();

  const colors = useMemo(
    () => (colorScheme === 'dark' ? COLORS.dark : COLORS.light),
    [colorScheme],
  );

  const navigationTheme = useMemo<Theme>(
    () => ({
      ...DefaultTheme,
      dark: colorScheme === 'dark',
      colors: {
        ...DefaultTheme.colors,
        ...colors,
      },
    }),
    [colorScheme, colors],
  );

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator initialRouteName="RecipeList">
        <Stack.Screen
          name="RecipeList"
          component={RecipeListScreen}
          options={SCREEN_OPTIONS.recipeList}
        />
        <Stack.Screen
          name="AddRecipe"
          component={AddRecipeScreen}
          options={SCREEN_OPTIONS.addRecipe}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
});

AppNavigator.displayName = 'AppNavigator';
