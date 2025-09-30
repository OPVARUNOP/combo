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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';

// Components
import TrackCard from '../../components/cards/TrackCard';
import PlaylistCard from '../../components/cards/PlaylistCard';
import AlbumCard from '../../components/cards/AlbumCard';
import ArtistCard from '../../components/cards/ArtistCard';
import SectionHeader from '../../components/common/SectionHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Mock API functions
const playlistAPI = {
  getUserPlaylists: async () => ({
    data: {
      playlists: [
        { id: '1', title: 'My Favorites', description: '25 tracks', trackCount: 25, artwork: null },
        { id: '2', title: 'Workout Mix', description: '15 tracks', trackCount: 15, artwork: null },
      ]
    }
  }),
  getRecentlyPlayed: async () => ({
    data: {
      playlists: [
        { id: '3', title: 'Recently Played', description: '12 tracks', trackCount: 12, artwork: null },
      ]
    }
  })
};

const trackAPI = {
  getLikedTracks: async () => ({
    data: {
      tracks: [
        { id: '1', title: 'Liked Track 1', artist: 'Artist 1', album: 'Album 1', duration: 180, artwork: null },
        { id: '2', title: 'Liked Track 2', artist: 'Artist 2', album: 'Album 2', duration: 240, artwork: null },
      ]
    }
  })
};

const albumAPI = {
  getUserAlbums: async () => ({
    data: {
      albums: [
        { id: '1', title: 'Saved Album 1', artist: 'Artist 1', trackCount: 12, artwork: null },
      ]
    }
  })
};

const artistAPI = {
  getFollowedArtists: async () => ({
    data: {
      artists: [
        { id: '1', name: 'Followed Artist 1', trackCount: 25, artwork: null },
      ]
    }
  })
};

// Theme
import { colors, spacing, typography, radius } from '../styles/theme';

const { width } = Dimensions.get('window');

const LibraryScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // State for different sections
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [likedPlaylists, setLikedPlaylists] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [downloadedTracks, setDownloadedTracks] = useState([]);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    loadLibraryData();
  }, []);

  const loadLibraryData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadMyPlaylists(),
        loadLikedPlaylists(),
        loadLikedTracks(),
        loadRecentlyPlayed(),
        loadDownloadedTracks(),
        loadFollowedArtists(),
        loadAlbums(),
      ]);
    } catch (error) {
      console.error('Error loading library data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyPlaylists = async () => {
    try {
      const response = await playlistAPI.getMyPlaylists();
      setMyPlaylists(response.data.playlists || []);
    } catch (error) {
      console.error('Error loading my playlists:', error);
    }
  };

  const loadLikedPlaylists = async () => {
    try {
      const response = await playlistAPI.getLikedPlaylists();
      setLikedPlaylists(response.data.playlists || []);
    } catch (error) {
      console.error('Error loading liked playlists:', error);
    }
  };

  const loadLikedTracks = async () => {
    try {
      const response = await trackAPI.getAll({ liked: true, limit: 20 });
      setLikedTracks(response.data.tracks || []);
    } catch (error) {
      console.error('Error loading liked tracks:', error);
    }
  };

  const loadRecentlyPlayed = async () => {
    try {
      // Mock data for now - replace with actual API call
      setRecentlyPlayed([
        {
          id: '1',
          title: 'Blinding Lights',
          artist: 'The Weeknd',
          artwork: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
          duration: 200000,
          playedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Watermelon Sugar',
          artist: 'Harry Styles',
          artwork: 'https://i.scdn.co/image/ab67616d0000b273adaa848e5c4e6b1b0e47b4e2',
          duration: 174000,
          playedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '3',
          title: 'Shape of You',
          artist: 'Ed Sheeran',
          artwork: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96',
          duration: 233000,
          playedAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error loading recently played:', error);
    }
  };

  const loadDownloadedTracks = async () => {
    try {
      // Mock data for now - replace with actual API call
      setDownloadedTracks([
        {
          id: '1',
          title: 'Blinding Lights',
          artist: 'The Weeknd',
          artwork: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
          duration: 200000,
          downloadedAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error loading downloaded tracks:', error);
    }
  };

  const loadFollowedArtists = async () => {
    try {
      const response = await artistAPI.getAll({ followed: true, limit: 10 });
      setFollowedArtists(response.data.artists || []);
    } catch (error) {
      console.error('Error loading followed artists:', error);
    }
  };

  const loadAlbums = async () => {
    try {
      const response = await albumAPI.getAll({ limit: 10 });
      setAlbums(response.data.albums || []);
    } catch (error) {
      console.error('Error loading albums:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLibraryData();
    setRefreshing(false);
  };

  const handleTrackPress = (track) => {
    navigation.navigate('Player', { track });
  };

  const handlePlaylistPress = (playlist) => {
    navigation.navigate('Playlist', { playlist });
  };

  const handleAlbumPress = (album) => {
    navigation.navigate('Album', { album });
  };

  const handleArtistPress = (artist) => {
    navigation.navigate('Artist', { artist });
  };

  const renderTrackItem = ({ item }) => (
    <TrackCard
      track={item}
      onPress={() => handleTrackPress(item)}
    />
  );

  const renderPlaylistItem = ({ item }) => (
    <PlaylistCard
      playlist={item}
      onPress={() => handlePlaylistPress(item)}
    />
  );

  const renderAlbumItem = ({ item }) => (
    <AlbumCard
      album={item}
      onPress={() => handleAlbumPress(item)}
    />
  );

  const renderArtistItem = ({ item }) => (
    <ArtistCard
      artist={item}
      onPress={() => handleArtistPress(item)}
    />
  );

  const LibraryHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>Your Library</Text>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreatePlaylist')}
        >
          <Ionicons name="add" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const LibraryStats = () => (
    <View style={styles.statsContainer}>
      <TouchableOpacity
        style={styles.statItem}
        onPress={() => navigation.navigate('LikedSongs')}
      >
        <View style={styles.statIcon}>
          <Ionicons name="heart" size={24} color={colors.primary} />
        </View>
        <Text style={styles.statNumber}>{likedTracks.length}</Text>
        <Text style={styles.statLabel}>Liked Songs</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.statItem}
        onPress={() => navigation.navigate('Downloads')}
      >
        <View style={styles.statIcon}>
          <Ionicons name="download" size={24} color={colors.secondary} />
        </View>
        <Text style={styles.statNumber}>{downloadedTracks.length}</Text>
        <Text style={styles.statLabel}>Downloads</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.statItem}
        onPress={() => navigation.navigate('FollowedArtists')}
      >
        <View style={styles.statIcon}>
          <Ionicons name="people" size={24} color={colors.success} />
        </View>
        <Text style={styles.statNumber}>{followedArtists.length}</Text>
        <Text style={styles.statLabel}>Artists</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.statItem}
        onPress={() => navigation.navigate('RecentPlays')}
      >
        <View style={styles.statIcon}>
          <Ionicons name="time" size={24} color={colors.info} />
        </View>
        <Text style={styles.statNumber}>{recentlyPlayed.length}</Text>
        <Text style={styles.statLabel}>Recent</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={colors.gradientBg}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <LibraryHeader />

        {/* Library Stats */}
        <LibraryStats />

        {/* My Playlists */}
        {myPlaylists.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Your Playlists"
              onSeeAll={() => navigation.navigate('MyPlaylists')}
            />
            <FlatList
              data={myPlaylists}
              renderItem={renderPlaylistItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Liked Songs */}
        {likedTracks.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Liked Songs"
              onSeeAll={() => navigation.navigate('LikedSongs')}
            />
            <FlatList
              data={likedTracks}
              renderItem={renderTrackItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Recently Played"
              onSeeAll={() => navigation.navigate('RecentPlays')}
            />
            <FlatList
              data={recentlyPlayed}
              renderItem={renderTrackItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Downloaded Tracks */}
        {downloadedTracks.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Downloaded"
              onSeeAll={() => navigation.navigate('Downloads')}
            />
            <FlatList
              data={downloadedTracks}
              renderItem={renderTrackItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Followed Artists */}
        {followedArtists.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Followed Artists"
              onSeeAll={() => navigation.navigate('FollowedArtists')}
            />
            <FlatList
              data={followedArtists}
              renderItem={renderArtistItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Liked Playlists */}
        {likedPlaylists.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Liked Playlists"
              onSeeAll={() => navigation.navigate('LikedPlaylists')}
            />
            <FlatList
              data={likedPlaylists}
              renderItem={renderPlaylistItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Albums"
              onSeeAll={() => navigation.navigate('MyAlbums')}
            />
            <FlatList
              data={albums}
              renderItem={renderAlbumItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Empty State */}
        {myPlaylists.length === 0 &&
         likedTracks.length === 0 &&
         recentlyPlayed.length === 0 &&
         downloadedTracks.length === 0 &&
         followedArtists.length === 0 &&
         likedPlaylists.length === 0 &&
         albums.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="library-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>Your library is empty</Text>
            <Text style={styles.emptyStateSubtitle}>
              Start by liking some songs or creating a playlist
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={styles.emptyStateButtonText}>Browse Music</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradientBackground: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 2,
  },
  menuButton: {
    padding: spacing.sm,
  },
  searchButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  addButton: {
    padding: spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  statItem: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.white10,
    minWidth: 80,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.white20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['4xl'],
    paddingTop: spacing['4xl'],
  },
  emptyStateTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  emptyStateButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default LibraryScreen;
