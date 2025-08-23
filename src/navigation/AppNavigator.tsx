import React, { memo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Recipe } from '../types/Recipe';
import { RecipeListScreen } from '../screens/RecipeListScreen';
import { AddRecipeScreen } from '../screens/AddRecipeScreen';

export type SerializableRecipe = Omit<Recipe, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type RootStackParamList = {
  RecipeList: undefined;
  AddRecipe: { recipe?: SerializableRecipe };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = memo(() => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="RecipeList">
        <Stack.Screen name="RecipeList" component={RecipeListScreen} />
        <Stack.Screen name="AddRecipe" component={AddRecipeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
});

AppNavigator.displayName = 'AppNavigator';
