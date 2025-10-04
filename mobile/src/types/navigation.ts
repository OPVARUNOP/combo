import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  // Auth Stack
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  
  // Main Tabs
  Main: undefined;
  
  // Main Tabs Screens
  Home: undefined;
  Search: undefined;
  Library: undefined;
  Profile: undefined;
  
  // Other Screens
  Player: { trackId: string };
  Playlist: { playlistId: string };
  Album: { albumId: string };
  Artist: { artistId: string };
  Settings: undefined;
};

// Navigation Props
export type NavigationProp = StackNavigationProp<RootStackParamList>;

// Route Props
export type RouteProps<T extends keyof RootStackParamList> = {
  navigation: NavigationProp;
  route: RouteProp<RootStackParamList, T>;
};

// Screen Component Type
export type ScreenComponentType<T extends keyof RootStackParamList> = React.FC<RouteProps<T>>;
