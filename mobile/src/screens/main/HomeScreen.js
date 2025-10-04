import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Theme
import { colors, spacing, typography } from '../../styles/theme';

// Components
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Redux actions
import {
  fetchRecommendations,
  fetchUserPreferences,
  addRecentActivity,
} from '../../store/slices/personalizationSlice';

// Mock data for demo
const mockTracks = [
  {
    id: '1',
    title: 'Sample Track 1',
    artist: 'Demo Artist',
    album: 'Demo Album',
    duration: 180,
    artwork: null,
  },
  {
    id: '2',
    title: 'Sample Track 2',
    artist: 'Demo Artist 2',
    album: 'Demo Album 2',
    duration: 240,
    artwork: null,
  },
];

const mockAlbums = [
  {
    id: '1',
    title: 'Demo Album',
    artist: 'Demo Artist',
    artwork: null,
    trackCount: 12,
  },
];

const mockPlaylists = [
  {
    id: '1',
    title: 'My Favorites',
    description: 'Your favorite tracks',
    artwork: null,
    trackCount: 25,
  },
];

import { useTheme } from '../../styles/theme';

const HomeScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redux state
  const {
    recommendations,
    preferences,
    loading: personalizationLoading,
  } = useSelector((state) => state.personalization);

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    loadHomeData();
  }, [user]);

  const loadHomeData = async () => {
    if (!user?.id) {
      return;
    }

    setLoading(true);

    try {
      // Fetch personalized recommendations
      await Promise.all([
        dispatch(fetchRecommendations({ userId: user.id, type: 'forYou' })),
        dispatch(fetchRecommendations({ userId: user.id, type: 'trending' })),
        dispatch(fetchRecommendations({ userId: user.id, type: 'newReleases' })),
        dispatch(fetchUserPreferences(user.id)),
      ]);

      // Track home screen visit
      dispatch(
        addRecentActivity({
          type: 'screen_visit',
          screen: 'home',
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const renderForYouItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.recommendationItem, { backgroundColor: theme.surface }]}
      onPress={() => {
        // Track recommendation click
        dispatch(
          addRecentActivity({
            type: 'recommendation_click',
            recommendationId: item.id,
            recommendationType: 'forYou',
          }),
        );
      }}
    >
      <View style={[styles.recommendationIcon, { backgroundColor: theme.primary + '20' }]}>
        <Ionicons name='sparkles' size={20} color={theme.primary} />
      </View>
      <View style={styles.recommendationContent}>
        <Text style={[styles.recommendationTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.recommendationDescription, { color: theme.textSecondary }]}>
          {item.description}
        </Text>
        <Text style={[styles.recommendationTracks, { color: theme.primary }]}>
          {item.tracks} tracks
        </Text>
      </View>
      <Ionicons name='chevron-forward' size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  const renderTrackItem = ({ item }) => (
    <TouchableOpacity style={[styles.trackItem, { backgroundColor: theme.surface }]}>
      <View style={styles.trackInfo}>
        <Text style={[styles.trackTitle, { color: theme.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.trackArtist, { color: theme.textSecondary }]} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
      <Ionicons name='play-circle' size={24} color={theme.primary} />
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }) => (
    <TouchableOpacity style={[styles.albumItem, { backgroundColor: theme.surface }]}>
      <View style={[styles.albumArtwork, { backgroundColor: theme.elevated }]}>
        <Ionicons name='musical-notes' size={32} color={theme.primary} />
      </View>
      <Text style={[styles.albumTitle, { color: theme.text }]} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={[styles.albumArtist, { color: theme.textSecondary }]} numberOfLines={1}>
        {item.artist}
      </Text>
    </TouchableOpacity>
  );

  const renderPlaylistItem = ({ item }) => (
    <TouchableOpacity style={[styles.playlistItem, { backgroundColor: theme.surface }]}>
      <View style={[styles.playlistArtwork, { backgroundColor: theme.elevated }]}>
        <Ionicons name='list' size={24} color={theme.primary} />
      </View>
      <Text style={[styles.playlistTitle, { color: theme.text }]} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={[styles.playlistDescription, { color: theme.textSecondary }]} numberOfLines={1}>
        {item.trackCount} tracks
      </Text>
    </TouchableOpacity>
  );

  if (loading || personalizationLoading.preferences) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <LoadingSpinner size='large' color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>Welcome to</Text>
        <Text style={[styles.appName, { color: theme.text }]}>COMBO</Text>
        <Text style={[styles.tagline, { color: theme.textSecondary }]}>Your Music, Your Way</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.surface }]}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name='search' size={24} color={theme.primary} />
          <Text style={[styles.actionText, { color: theme.text }]}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.surface }]}
          onPress={() => navigation.navigate('Library')}
        >
          <Ionicons name='library' size={24} color={theme.primary} />
          <Text style={[styles.actionText, { color: theme.text }]}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.surface }]}>
          <Ionicons name='heart' size={24} color={theme.primary} />
          <Text style={[styles.actionText, { color: theme.text }]}>Liked</Text>
        </TouchableOpacity>
      </View>

      {/* For You - AI Personalization */}
      {recommendations.forYou && recommendations.forYou.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name='sparkles' size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Made for You</Text>
          </View>
          <FlatList
            data={recommendations.forYou}
            renderItem={renderForYouItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Trending Music */}
      {recommendations.trending && recommendations.trending.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Trending Now</Text>
          <FlatList
            data={recommendations.trending}
            renderItem={renderPlaylistItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* New Releases */}
      {recommendations.newReleases && recommendations.newReleases.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>New Releases</Text>
          <FlatList
            data={recommendations.newReleases}
            renderItem={renderPlaylistItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Recently Played */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recently Played</Text>
        <FlatList
          data={mockTracks}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      {/* Featured Albums */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Albums</Text>
        <FlatList
          data={mockAlbums}
          renderItem={renderAlbumItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      {/* Your Playlists */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Playlists</Text>
        <FlatList
          data={mockPlaylists}
          renderItem={renderPlaylistItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    minWidth: 80,
    padding: spacing.md,
  },
  actionText: {
    color: colors.text,
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  albumArtist: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    textAlign: 'center',
  },
  albumArtwork: {
    alignItems: 'center',
    backgroundColor: colors.elevated,
    borderRadius: 8,
    height: 80,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 80,
  },
  albumItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginRight: spacing.md,
    padding: spacing.md,
    width: 160,
  },
  albumTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
    textAlign: 'center',
  },
  appName: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: spacing.xs,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  playlistArtwork: {
    alignItems: 'center',
    backgroundColor: colors.elevated,
    borderRadius: 8,
    height: 60,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 60,
  },
  playlistDescription: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    textAlign: 'center',
  },
  playlistItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginRight: spacing.md,
    padding: spacing.md,
    width: 160,
  },
  playlistTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationDescription: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    marginBottom: 2,
  },
  recommendationIcon: {
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 40,
  },
  recommendationItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    flexDirection: 'row',
    marginRight: spacing.md,
    padding: spacing.md,
    width: 200,
  },
  recommendationTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  recommendationTracks: {
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
    marginLeft: spacing.lg,
  },
  tagline: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontStyle: 'italic',
  },
  trackArtist: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: spacing.md,
    padding: spacing.md,
    width: 200,
  },
  trackTitle: {
    color: colors.text,
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  welcomeText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
});

export default HomeScreen;
