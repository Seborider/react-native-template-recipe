module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    '\\.(png|jpg|jpeg|gif|svg)$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-navigation|@react-navigation|react-native-haptic-feedback|react-native-image-picker|@react-native-async-storage|react-native-gesture-handler)/)',
  ],
  setupFiles: ['./jest.setup.js'],
};
