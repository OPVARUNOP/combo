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

// Theme
import { colors, spacing, typography } from '../../styles/theme';

// Components
import LoadingSpinner from '../../components/common/LoadingSpinner';

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

const HomeScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const renderTrackItem = ({ item }) => (
    <TouchableOpacity style={styles.trackItem}>
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
      <Ionicons name="play-circle" size={24} color={colors.primary} />
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }) => (
    <TouchableOpacity style={styles.albumItem}>
      <View style={styles.albumArtwork}>
        <Ionicons name="musical-notes" size={32} color={colors.primary} />
      </View>
      <Text style={styles.albumTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.albumArtist} numberOfLines={1}>
        {item.artist}
      </Text>
    </TouchableOpacity>
  );

  const renderPlaylistItem = ({ item }) => (
    <TouchableOpacity style={styles.playlistItem}>
      <View style={styles.playlistArtwork}>
        <Ionicons name="list" size={24} color={colors.primary} />
      </View>
      <Text style={styles.playlistTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.playlistDescription} numberOfLines={1}>
        {item.trackCount} tracks
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.appName}>COMBO</Text>
        <Text style={styles.tagline}>Your Music, Your Way</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="search" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="library" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Liked</Text>
        </TouchableOpacity>
      </View>

      {/* Recently Played */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recently Played</Text>
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
        <Text style={styles.sectionTitle}>Featured Albums</Text>
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
        <Text style={styles.sectionTitle}>Your Playlists</Text>
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.medium,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 4,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.bold,
  },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    fontFamily: typography.fontFamily.medium,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    minWidth: 80,
  },
  actionText: {
    color: colors.text,
    fontSize: 12,
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily.medium,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    marginLeft: spacing.lg,
    fontFamily: typography.fontFamily.semiBold,
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
  },
  trackItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.md,
    width: 200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: typography.fontFamily.medium,
  },
  trackArtist: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
  },
  albumItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.md,
    width: 160,
    alignItems: 'center',
  },
  albumArtwork: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  albumTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
    fontFamily: typography.fontFamily.medium,
  },
  albumArtist: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    fontFamily: typography.fontFamily.regular,
  },
  playlistItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.md,
    width: 160,
    alignItems: 'center',
  },
  playlistArtwork: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  playlistTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
    fontFamily: typography.fontFamily.medium,
  },
  playlistDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    fontFamily: typography.fontFamily.regular,
  },
});

export default HomeScreen;
