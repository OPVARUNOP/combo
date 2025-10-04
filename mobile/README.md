# Streamify Mobile App

A React Native music streaming application with modern UI/UX design.

## Features

- 🎵 Advanced music player with gesture controls
- 🔍 Smart search with voice recognition and lyrics search
- 📱 Personalized home screen with recommendations
- 💾 Offline music downloads and management
- 👥 Social features and collaborative playlists
- 📊 Listening statistics and analytics

## Tech Stack

- React Native 0.72+
- React Navigation 6
- Redux Toolkit for state management
- React Native Track Player
- React Native Reanimated
- React Native Gesture Handler
- React Native Async Storage
- React Native Vector Icons

## Getting Started

### Prerequisites

- Node.js 18+
- React Native development environment
- Android Studio or Xcode
- Backend API running

### Installation

1. Install dependencies:

```bash
npm install
```

2. For iOS:

```bash
cd ios && pod install
```

3. Start Metro bundler:

```bash
npm start
```

4. Run on device:

```bash
# iOS
npm run ios

# Android
npm run android
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Basic components (Button, Text, etc.)
│   ├── music/          # Music-specific components
│   ├── player/         # Player components
│   └── social/         # Social features components
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   ├── main/          # Main app screens
│   ├── player/        # Music player screens
│   └── settings/      # Settings screens
├── navigation/        # Navigation configuration
├── redux/            # Redux store and slices
├── services/         # API services and utilities
├── styles/           # Global styles and themes
├── utils/            # Utility functions
└── types/            # TypeScript type definitions
```

## Design System

### Colors

- Primary: #1DB954 (Spotify Green)
- Secondary: #121212 (Dark Background)
- Accent: #FF6B6B (Coral)
- Text Primary: #FFFFFF
- Text Secondary: #B3B3B3
- Surface: #181818

### Typography

- Primary Font: Circular (Spotify's font)
- Fallback: System font stack

### Spacing

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

## Core Components

### Music Player

- Full-screen player with gesture controls
- Mini player for background playback
- Queue management with drag & drop
- Lyrics synchronization
- Sleep timer functionality

### Search Interface

- Instant search with debouncing
- Voice search integration
- Advanced filters (genre, artist, mood)
- Search history and suggestions

### Home Screen

- Personalized recommendations algorithm
- Recently played tracks
- Mood-based playlist suggestions
- New releases carousel
- Horizontal scrolling sections

### Library Management

- Downloaded music management
- Playlist organization with folders
- Favorite artists and tracks
- Listening statistics dashboard

## Development Guidelines

### Component Structure

All components should follow this pattern:

```javascript
const ComponentName = ({ prop1, prop2 }) => {
  // Custom hooks
  // State management
  // Event handlers
  // Render logic

  return <View style={styles.container}>{/* Component JSX */}</View>;
};

const styles = StyleSheet.create({
  container: {
    // Styles
  },
});
```

### State Management

Use Redux Toolkit for global state:

- Auth slice for user authentication
- Player slice for music playback state
- Library slice for user library
- Search slice for search functionality

### API Integration

All API calls should be handled through services:

- Authentication service
- Music service
- User service
- Social service

## Performance Optimization

- Use React.memo for component memoization
- Implement virtual scrolling for large lists
- Optimize images with progressive loading
- Use background tasks for downloads
- Implement proper memory management

## Testing

- Unit tests with Jest
- Integration tests with React Native Testing Library
- E2E tests with Detox

## Deployment

### iOS

- Code signing with certificates
- App Store Connect configuration
- TestFlight for beta testing

### Android

- Keystore management
- Play Store Console configuration
- Internal testing track

## Contributing

1. Follow the established code style
2. Write tests for new features
3. Update documentation
4. Use conventional commit messages

## License

MIT
