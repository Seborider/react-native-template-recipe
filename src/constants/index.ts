export const IMAGE_SIZE = 80;

/** Standard spacing between images in horizontal lists */
export const IMAGE_SPACING = 12;

/** Default spacing for general UI elements */
export const DEFAULT_SPACING = 8;

/** Maximum allowed characters for recipe title */
export const MAX_TITLE_LENGTH = 100;

/** Maximum allowed characters for recipe description */
export const MAX_DESCRIPTION_LENGTH = 1000;

/** Maximum number of images allowed per recipe */
export const MAX_IMAGES = 8;

/** Default maximum images for image picker component */
export const DEFAULT_MAX_IMAGES = 10;

/** Default image quality for picked images (0.0 - 1.0) */
export const DEFAULT_IMAGE_QUALITY = 0.8;

/** Maximum number of images that can be selected at once */
export const MAX_SELECTION_LIMIT = 5;

/** Keyboard offset for iOS when avoiding keyboard */
export const KEYBOARD_VERTICAL_OFFSET_IOS = 0;

/** Keyboard offset for Android when avoiding keyboard */
export const KEYBOARD_VERTICAL_OFFSET_ANDROID = 20;

/** Key for storing navigation state in AsyncStorage */
export const NAVIGATION_STATE_KEY = '@recipe_app_nav_state';

/** Default image size for Picsum placeholder images */
export const DEFAULT_IMAGE_SIZE = 400;

/** Cache timeout for storage operations (5 minutes) */
export const CACHE_TIMEOUT = 5 * 60 * 1000;

/** Cache TTL for image validation (5 minutes) */
export const VALIDATION_CACHE_TTL = 5 * 60 * 1000;

/** Timeout for image loading requests (3 seconds) */
export const IMAGE_LOAD_TIMEOUT = 3000;

/** Threshold for detecting swipe gestures */
export const SWIPE_THRESHOLD = 40;

/** Friction factor for swipe animations */
export const SWIPE_FRICTION = 4;

/** Minimum blur value for Picsum images */
export const MIN_BLUR = 1;

/** Maximum blur value for Picsum images */
export const MAX_BLUR = 10;

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

export const HAPTIC_OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
} as const;
