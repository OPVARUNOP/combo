import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';

// Components
import TrackCard from '../../components/cards/TrackCard';
import SectionHeader from '../../components/common/SectionHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Services
// Mock API functions for playlist functionality
const playlistAPI = {
  getById: async (id) => {
    // Mock playlist data
    return {
      data: {
        playlist: {
          id,
          title: 'Sample Playlist',
          description: 'A collection of great tracks',
          artwork: null,
          trackCount: 25,
          duration: 3600,
          isPublic: true,
          createdBy: 'Demo User',
          tracks: [
            {
              id: '1',
              title: 'Track 1',
              artist: 'Artist 1',
              album: 'Album 1',
              duration: 180,
              artwork: null,
            },
            {
              id: '2',
              title: 'Track 2',
              artist: 'Artist 2',
              album: 'Album 2',
              duration: 240,
              artwork: null,
            },
          ],
        },
      },
    };
  },
};

const trackAPI = {
  getByIds: async (ids) => {
    // Mock track data
    return {
      data: {
        tracks: ids.map((id) => ({
          id,
          title: `Track ${id}`,
          artist: `Artist ${id}`,
          album: `Album ${id}`,
          duration: 180,
          artwork: null,
        })),
      },
    };
  },
};

const socialAPI = {
  followPlaylist: async (id) => {
    return { data: { success: true } };
  },
  unfollowPlaylist: async (id) => {
    return { data: { success: true } };
  },
};

// Theme
import { colors, spacing, typography, radius, shadows } from '../../styles/theme';

const { width, height } = Dimensions.get('window');

const PlaylistScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { playlist } = route.params || {};

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playlistData, setPlaylistData] = useState(playlist || null);
  const [tracks, setTracks] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (playlistData) {
      loadPlaylistData();
    } else {
      // Handle case where playlist data is not passed
      navigation.goBack();
    }
  }, [playlistData]);

  const loadPlaylistData = async () => {
    try {
      setLoading(true);

      // Load playlist details if not fully loaded
      if (!playlistData.tracks) {
        const response = await playlistAPI.getById(playlistData.id);
        setPlaylistData(response.data.playlist);
      }

      // Load tracks
      await loadTracks();

      // Load interaction states
      await loadInteractionStates();
    } catch (error) {
      console.error('Error loading playlist data:', error);
      Alert.alert('Error', 'Failed to load playlist data');
    } finally {
      setLoading(false);
    }
  };

  const loadTracks = async () => {
    try {
      if (playlistData.tracks) {
        setTracks(playlistData.tracks);
      } else {
        // Load tracks from API if not included in playlist data
        const response = await playlistAPI.getTracks(playlistData.id);
        setTracks(response.data.tracks || []);
      }
    } catch (error) {
      console.error('Error loading tracks:', error);
    }
  };

  const loadInteractionStates = async () => {
    try {
      // Check if playlist is liked
      const likedResponse = await playlistAPI.isLiked(playlistData.id);
      setIsLiked(likedResponse.data.isLiked);

      // Check if user is following the playlist creator (if not own playlist)
      if (playlistData.userId !== 'currentUserId') {
        const followingResponse = await socialAPI.isFollowing(playlistData.userId);
        setIsFollowing(followingResponse.data.isFollowing);
      }
    } catch (error) {
      console.error('Error loading interaction states:', error);
    }
  };

  const handleTrackPress = (track) => {
    navigation.navigate('Player', { track, queue: tracks });
  };

  const handleLikePress = async () => {
    try {
      if (isLiked) {
        await playlistAPI.unlike(playlistData.id);
        setIsLiked(false);
      } else {
        await playlistAPI.like(playlistData.id);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleFollowPress = async () => {
    try {
      if (isFollowing) {
        await socialAPI.unfollowUser(playlistData.userId);
        setIsFollowing(false);
      } else {
        await socialAPI.followUser(playlistData.userId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this playlist: ${playlistData.title} by ${playlistData.userName}`,
        url: `https://combo.app/playlist/${playlistData.id}`,
      });
    } catch (error) {
      console.error('Error sharing playlist:', error);
    }
  };

  const handleEditPlaylist = () => {
    navigation.navigate('EditPlaylist', { playlist: playlistData });
  };

  const handlePlayAll = () => {
    navigation.navigate('Player', { track: tracks[0], queue: tracks });
  };

  const handleShufflePlay = () => {
    const shuffledTracks = [...tracks].sort(() => Math.random() - 0.5);
    navigation.navigate('Player', {
      track: shuffledTracks[0],
      queue: shuffledTracks,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlaylistData();
    setRefreshing(false);
  };

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateTotalDuration = () => {
    const total = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
    const hours = Math.floor(total / 3600000);
    const minutes = Math.floor((total % 3600000) / 60000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size='large' />
      </View>
    );
  }

  if (!playlistData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Playlist not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <LinearGradient colors={colors.gradientBg} style={styles.gradientBackground}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name='arrow-back' size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name='share-outline' size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => console.log('More options')}
            >
              <Ionicons name='ellipsis-horizontal' size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Playlist Info */}
        <View style={styles.playlistInfo}>
          <FastImage
            source={{ uri: playlistData.coverImage }}
            style={styles.coverImage}
            resizeMode='cover'
          />

          <View style={styles.playlistDetails}>
            <Text style={styles.playlistTitle} numberOfLines={2}>
              {playlistData.title}
            </Text>

            <Text style={styles.playlistSubtitle} numberOfLines={1}>
              by {playlistData.userName}
            </Text>

            <View style={styles.playlistStats}>
              <Text style={styles.statsText}>
                {tracks.length} tracks • {calculateTotalDuration()}
              </Text>
              {playlistData.isPublic && <Text style={styles.publicText}>Public</Text>}
            </View>

            <Text style={styles.description} numberOfLines={3}>
              {playlistData.description || 'No description available'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={handlePlayAll}>
            <Ionicons name='play' size={20} color={colors.white} />
            <Text style={styles.primaryButtonText}>Play All</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleShufflePlay}>
            <Ionicons name='shuffle' size={20} color={colors.text} />
            <Text style={styles.secondaryButtonText}>Shuffle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, isLiked && styles.likedButton]}
            onPress={handleLikePress}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? colors.error : colors.text}
            />
          </TouchableOpacity>

          {playlistData.userId !== 'currentUserId' && (
            <TouchableOpacity
              style={[styles.iconButton, isFollowing && styles.followingButton]}
              onPress={handleFollowPress}
            >
              <Ionicons
                name={isFollowing ? 'person-remove' : 'person-add'}
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
          )}

          {playlistData.userId === 'currentUserId' && (
            <TouchableOpacity style={styles.iconButton} onPress={handleEditPlaylist}>
              <Ionicons name='pencil' size={20} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tracks List */}
        <View style={styles.tracksSection}>
          <SectionHeader title={`Tracks (${tracks.length})`} />

          {tracks.length > 0 ? (
            <FlatList
              data={tracks}
              renderItem={({ item, index }) => (
                <TouchableOpacity style={styles.trackItem} onPress={() => handleTrackPress(item)}>
                  <View style={styles.trackNumber}>
                    <Text style={styles.trackNumberText}>{index + 1}</Text>
                  </View>

                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>
                      {item.artist}
                    </Text>
                  </View>

                  <View style={styles.trackActions}>
                    <Text style={styles.trackDuration}>{formatDuration(item.duration)}</Text>
                    <TouchableOpacity style={styles.moreButton}>
                      <Ionicons name='ellipsis-horizontal' size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyTracks}>
              <Text style={styles.emptyText}>No tracks in this playlist</Text>
            </View>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    padding: spacing.sm,
  },
  actionButtons: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  bottomSpacing: {
    height: 100,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  coverImage: {
    alignSelf: 'center',
    borderRadius: radius.xl,
    height: width * 0.6,
    marginBottom: spacing.lg,
    width: width * 0.6,
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
  },
  emptyTracks: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
  },
  followingButton: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing['3xl'] : spacing.xl,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white10,
    borderRadius: radius.full,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  likedButton: {
    backgroundColor: colors.error + '20',
    borderColor: colors.error,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  moreButton: {
    padding: spacing.xs,
  },
  playlistDetails: {
    alignItems: 'center',
  },
  playlistInfo: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  playlistStats: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  playlistSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.lg,
    marginBottom: spacing.sm,
  },
  playlistTitle: {
    color: colors.text,
    fontSize: typography.fontSize['3xl'],
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    ...shadows.md,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  publicText: {
    backgroundColor: colors.primary + '20',
    borderRadius: radius.sm,
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.white10,
    borderRadius: radius.full,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  statsText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginRight: spacing.md,
  },
  trackActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  trackArtist: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  trackDuration: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    minWidth: 40,
    textAlign: 'right',
  },
  trackInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  trackItem: {
    alignItems: 'center',
    borderBottomColor: colors.white10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  trackNumber: {
    alignItems: 'center',
    width: 30,
  },
  trackNumberText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  trackTitle: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    marginBottom: 2,
  },
  tracksSection: {
    paddingHorizontal: spacing.lg,
  },
});

export default PlaylistScreen;
