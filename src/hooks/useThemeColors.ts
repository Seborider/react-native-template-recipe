import { useColorScheme } from 'react-native';
import { COLORS } from '../constants/colors';

export const useThemeColors = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? COLORS.dark : COLORS.light;

  return { colors, isDark };
};
