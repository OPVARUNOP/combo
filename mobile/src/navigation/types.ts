// Root Stack Navigator - Handles authentication flow and main app
export type RootStackParamList = {
  Auth: undefined;     // Auth stack
  Main: undefined;     // Main app (tabs)
  // Add other modal/popup screens that should be outside the tab navigator
};

// Auth Stack Navigator - Handles authentication screens
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: { email?: string }; // Optional email for pre-filling
};

// Main Tab Navigator - Bottom tab navigation for the main app
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
  Profile: undefined;
};

// Home Stack Navigator - Nested stack for home tab
export type HomeStackParamList = {
  HomeMain: undefined;
  // Add home tab specific screens here
};

// Search Stack Navigator - Nested stack for search tab
export type SearchStackParamList = {
  SearchMain: undefined;
  // Add search tab specific screens here
};

// Library Stack Navigator - Nested stack for library tab
export type LibraryStackParamList = {
  LibraryMain: undefined;
  // Add library tab specific screens here
};

// Profile Stack Navigator - Nested stack for profile tab
export type ProfileStackParamList = {
  ProfileMain: undefined;
  // Add profile tab specific screens here
};

// Combine all param list types for easy access
export type AllParamList = RootStackParamList &
  AuthStackParamList &
  MainTabParamList &
  HomeStackParamList &
  SearchStackParamList &
  LibraryStackParamList &
  ProfileStackParamList;
