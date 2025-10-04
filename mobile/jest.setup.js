import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock React Native's Animated
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  // Mock any Reanimated functions you use
  Reanimated.default.call = () => {};
  
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: 'View',
    DrawerLayout: 'View',
    State: {},
    ScrollView: 'View',
    Slider: 'View',
    Switch: 'View',
    TextInput: 'TextInput',
    ToolbarAndroid: 'ToolbarAndroid',
    ViewPagerAndroid: 'View',
    DrawerLayoutAndroid: 'View',
    WebView: 'View',
    NativeViewGestureHandler: 'View',
    TapGestureHandler: 'View',
    FlingGestureHandler: 'View',
    ForceTouchGestureHandler: 'View',
    LongPressGestureHandler: 'View',
    PanGestureHandler: 'View',
    PinchGestureHandler: 'View',
    RotationGestureHandler: 'View',
    /* Buttons */
    RawButton: 'View',
    BaseButton: 'View',
    RectButton: 'View',
    BorderlessButton: 'View',
    /* Other */
    FlatList: 'FlatList',
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

// Mock react-navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      dispatch: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});
