/** Key for storing navigation state in AsyncStorage */
export const NAVIGATION_STATE_KEY = '@recipe_app_nav_state';

export const COLORS = {
  light: {
    primary: '#007AFF',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    border: '#E5E5EA',
    notification: '#FF3B30',
    secondary: '#F2F2F7',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
  },
  dark: {
    primary: '#0A84FF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#38383A',
    notification: '#FF453A',
    secondary: '#1C1C1E',
    success: '#30D158',
    warning: '#FF9F0A',
    danger: '#FF453A',
  },
} as const;
