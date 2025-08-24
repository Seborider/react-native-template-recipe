import { useColorScheme } from 'react-native';
import { COLORS } from '../constants/colors';

export const useThemeColors = () => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? COLORS.dark : COLORS.light;
};
