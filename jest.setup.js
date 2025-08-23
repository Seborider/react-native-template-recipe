/* eslint-env jest */

// Mock AsyncStorage before importing other modules
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

// Mock react-native-fast-image
jest.mock('react-native-fast-image', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Image } = require('react-native');

  const FastImage = props => {
    const { source, ...otherProps } = props;
    const imageSource = source?.uri ? { uri: source.uri } : source;
    return React.createElement(Image, { source: imageSource, ...otherProps });
  };

  FastImage.priority = {
    low: 'low',
    normal: 'normal',
    high: 'high',
  };

  FastImage.cacheControl = {
    immutable: 'immutable',
    web: 'web',
    cacheOnly: 'cacheOnly',
  };

  FastImage.resizeMode = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'stretch',
    center: 'center',
  };

  FastImage.preload = jest.fn();
  FastImage.clearMemoryCache = jest.fn(() => Promise.resolve());
  FastImage.clearDiskCache = jest.fn(() => Promise.resolve());

  return FastImage;
});

// Mock react-native-haptic-feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

// Mock NavigationContainer
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  NavigationContainer: ({ children }) => children,
  useFocusEffect: jest.fn(),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const View = require('react-native/Libraries/Components/View/View');
  const MockReanimatedSwipeable = React.forwardRef((props, ref) => {
    return React.createElement(View, { ...props, ref });
  });

  return {
    Swipeable: ({ children }) => children,
    GestureHandlerRootView: ({ children }) => children,
    PanGestureHandler: ({ children }) => children,
    BaseButton: ({ children }) => children,
    RectButton: ({ children }) => children,
    BorderlessButton: ({ children }) => children,
    ReanimatedSwipeable: MockReanimatedSwipeable,
    State: {
      BEGAN: 'BEGAN',
      FAILED: 'FAILED',
      CANCELLED: 'CANCELLED',
      ACTIVE: 'ACTIVE',
      END: 'END',
    },
    Direction: {
      RIGHT: 1,
      LEFT: 2,
      UP: 4,
      DOWN: 8,
    },
  };
});

// Mock the ReanimatedSwipeable from the specific path
jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const View = require('react-native/Libraries/Components/View/View');

  const MockReanimatedSwipeable = React.forwardRef((props, ref) => {
    return React.createElement(View, { ...props, ref });
  });

  return {
    __esModule: true,
    default: MockReanimatedSwipeable,
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const View = require('react-native/Libraries/Components/View/View');

  return {
    default: {
      View: View,
      call: jest.fn(),
    },
    useSharedValue: jest.fn(initial => ({
      value: initial,
      get: jest.fn(() => initial),
      set: jest.fn(),
    })),
    useAnimatedStyle: jest.fn(fn => fn()),
    useAnimatedReaction: jest.fn(),
    interpolate: jest.fn((value, input, output) => output[0]),
    View: View,
  };
});
