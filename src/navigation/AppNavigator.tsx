import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  InitialState,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import {
  useColorScheme,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '../types/Recipe';
import { RecipeListScreen } from '../screens/RecipeListScreen';
import { AddRecipeScreen } from '../screens/AddRecipeScreen';
import { NAVIGATION_STATE_KEY, COLORS } from '../constants';

export type SerializableRecipe = Omit<Recipe, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type RootStackParamList = {
  RecipeList: undefined;
  AddRecipe: { recipe?: SerializableRecipe };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const getScreenOptions = (isDark: boolean): NativeStackNavigationOptions => {
  const colors = isDark ? COLORS.dark : COLORS.light;
  return {
    headerStyle: {
      backgroundColor: colors.card,
    },
    headerTintColor: colors.primary,
    headerTitleStyle: {
      fontWeight: '600',
    },
    headerTitleAlign: 'center',
    headerBackTitleVisible: false,
    headerLargeTitle: false,
    headerTransparent: false,
  };
};

const SCREEN_CONFIG = {
  recipeList: {
    title: 'Your Recipes',
    headerLargeTitle: true,
    headerLargeTitleStyle: {
      fontWeight: '700',
    },
  },
  addRecipe: ({
    route,
  }: {
    route: { params?: { recipe?: SerializableRecipe } };
  }) => ({
    title: route.params?.recipe ? 'Edit Recipe' : 'Add Recipe',
    presentation: 'modal' as const,
    gestureEnabled: true,
    gestureDirection: 'vertical' as const,
  }),
} as const;

export const AppNavigator = memo(() => {
  const colorScheme = useColorScheme();

  const [{ isReady, initialState }, setNavigationState] = useState(() => {
    const restoreState = async () => {
      try {
        const savedStateString = await AsyncStorage.getItem(
          NAVIGATION_STATE_KEY,
        );
        if (savedStateString) {
          const state = JSON.parse(savedStateString);
          setNavigationState({ isReady: true, initialState: state });
        } else {
          setNavigationState({ isReady: true, initialState: undefined });
        }
      } catch (error) {
        console.warn('Failed to restore navigation state:', error);
        setNavigationState({ isReady: true, initialState: undefined });
      }
    };

    restoreState();

    return { isReady: false, initialState: undefined };
  });

  const isDark = colorScheme === 'dark';
  const colors = isDark ? COLORS.dark : COLORS.light;

  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      dark: isDark,
      colors: {
        ...DefaultTheme.colors,
        ...colors,
      },
    }),
    [isDark, colors],
  );

  const screenOptions = getScreenOptions(isDark);

  const onStateChange = useCallback(async (state: InitialState | undefined) => {
    try {
      await AsyncStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save navigation state:', error);
    }
  }, []);

  if (!isReady) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={navigationTheme}
      initialState={initialState}
      onStateChange={onStateChange}>
      <Stack.Navigator
        initialRouteName="RecipeList"
        screenOptions={screenOptions}>
        <Stack.Screen
          name="RecipeList"
          component={RecipeListScreen}
          options={SCREEN_CONFIG.recipeList}
        />
        <Stack.Screen
          name="AddRecipe"
          component={AddRecipeScreen}
          options={SCREEN_CONFIG.addRecipe}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
});

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

AppNavigator.displayName = 'AppNavigator';
