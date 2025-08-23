import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  Theme,
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

const createScreenOptions = (
  colors: typeof COLORS.light | typeof COLORS.dark,
): NativeStackNavigationOptions => ({
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
});

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
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState<InitialState | undefined>();

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

  const defaultScreenOptions = useMemo(
    () => createScreenOptions(colors),
    [colors],
  );

  useEffect(() => {
    const restoreNavigationState = async () => {
      try {
        const savedStateString = await AsyncStorage.getItem(
          NAVIGATION_STATE_KEY,
        );
        if (savedStateString) {
          const state = JSON.parse(savedStateString);
          setInitialState(state);
        }
      } catch (error) {
        console.warn('Failed to restore navigation state:', error);
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      restoreNavigationState();
    }
  }, [isReady]);

  const onStateChange = useCallback(async (state: InitialState | undefined) => {
    try {
      await AsyncStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save navigation state:', error);
    }
  }, []);

  if (!isReady) {
    return (
      <View style={styles.splashContainer}>
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
        screenOptions={defaultScreenOptions}>
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

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light.background,
  },
});

AppNavigator.displayName = 'AppNavigator';
