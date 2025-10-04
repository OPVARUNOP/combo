import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';

// Theme
import { colors, spacing, typography, radius } from '../../styles/theme';

// Components
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Redux (for artist data if needed)
import { addRecentActivity } from '../../store/slices/personalizationSlice';

const ArtistPortalScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock artist data - replace with real Redux state
  const [artistProfile, setArtistProfile] = useState(null);
  const [artistStats, setArtistStats] = useState({
    totalStreams: 0,
    totalListeners: 0,
    totalTracks: 0,
    totalAlbums: 0,
    monthlyGrowth: 0,
  });

  const [recentTracks, setRecentTracks] = useState([]);
  const [recentAlbums, setRecentAlbums] = useState([]);
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    loadArtistData();
  }, []);

  const loadArtistData = async () => {
    setLoading(true);
    try {
      // Simulate API calls - replace with real data fetching
      await Promise.all([
        loadArtistProfile(),
        loadArtistStats(),
        loadRecentContent(),
        loadAnalytics(),
      ]);

      // Track portal visit
      dispatch(
        addRecentActivity({
          type: 'screen_visit',
          screen: 'artist_portal',
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.error('Error loading artist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadArtistProfile = async () => {
    // Mock artist profile - replace with API call
    setArtistProfile({
      id: 'artist_1',
      name: 'Demo Artist',
      bio: 'Independent music creator and producer',
      avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
      coverImage: 'https://picsum.photos/800/400',
      location: 'Los Angeles, CA',
      website: 'https://demoartist.com',
      socialLinks: {
        instagram: '@demoartist',
        twitter: '@demoartist',
        spotify: 'spotify:artist:demo',
      },
      isVerified: true,
      joinedDate: '2022-01-15',
      totalStreams: 1250000,
      totalListeners: 45000,
    });
  };

  const loadArtistStats = async () => {
    // Mock stats - replace with API call
    setArtistStats({
      totalStreams: 1250000,
      totalListeners: 45000,
      totalTracks: 45,
      totalAlbums: 3,
      monthlyGrowth: 12.5,
      topCountries: ['US', 'UK', 'CA'],
      topCities: ['Los Angeles', 'New York', 'London'],
    });
  };

  const loadRecentContent = async () => {
    // Mock recent content - replace with API call
    setRecentTracks([
      {
        id: '1',
        title: 'New Single Release',
        streams: 25000,
        releaseDate: new Date().toISOString(),
        status: 'published',
      },
      {
        id: '2',
        title: 'Upcoming Track',
        streams: 0,
        releaseDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'draft',
      },
    ]);

    setRecentAlbums([
      {
        id: '1',
        title: 'Latest Album',
        tracks: 12,
        streams: 150000,
        releaseDate: new Date(Date.now() - 2592000000).toISOString(),
        status: 'published',
      },
    ]);
  };

  const loadAnalytics = async () => {
    // Mock analytics - replace with API call
    setAnalytics({
      dailyStreams: [
        { date: '2024-01-01', streams: 1200 },
        { date: '2024-01-02', streams: 1350 },
        { date: '2024-01-03', streams: 1100 },
      ],
      topTracks: [
        { title: 'Hit Single', streams: 50000 },
        { title: 'Popular Track', streams: 35000 },
      ],
      demographics: {
        ageGroups: { '18-24': 35, '25-34': 45, '35+': 20 },
        genders: { male: 55, female: 40, other: 5 },
      },
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadArtistData();
    setRefreshing(false);
  };

  const handleUploadMusic = () => {
    navigation.navigate('UploadMusic');
  };

  const handleCreateAlbum = () => {
    navigation.navigate('CreateAlbum');
  };

  const handleViewAnalytics = () => {
    navigation.navigate('ArtistAnalytics');
  };

  const handleEditProfile = () => {
    navigation.navigate('EditArtistProfile');
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name='arrow-back' size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Artist Portal</Text>
      <TouchableOpacity onPress={handleEditProfile}>
        <Ionicons name='settings-outline' size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderArtistInfo = () => (
    <View style={styles.artistInfoContainer}>
      <FastImage source={{ uri: artistProfile?.avatar }} style={styles.artistAvatar} />
      <View style={styles.artistDetails}>
        <View style={styles.artistNameRow}>
          <Text style={styles.artistName}>{artistProfile?.name}</Text>
          {artistProfile?.isVerified && (
            <MaterialIcons name='verified' size={20} color={colors.primary} />
          )}
        </View>
        <Text style={styles.artistBio}>{artistProfile?.bio}</Text>
        <Text style={styles.artistLocation}>{artistProfile?.location}</Text>
      </View>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{formatNumber(artistStats.totalStreams)}</Text>
        <Text style={styles.statLabel}>Total Streams</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{formatNumber(artistStats.totalListeners)}</Text>
        <Text style={styles.statLabel}>Listeners</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{artistStats.totalTracks}</Text>
        <Text style={styles.statLabel}>Tracks</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{artistStats.totalAlbums}</Text>
        <Text style={styles.statLabel}>Albums</Text>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity style={styles.actionButton} onPress={handleUploadMusic}>
        <Ionicons name='cloud-upload' size={24} color={colors.primary} />
        <Text style={styles.actionButtonText}>Upload Music</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleCreateAlbum}>
        <Ionicons name='add-circle' size={24} color={colors.primary} />
        <Text style={styles.actionButtonText}>Create Album</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleViewAnalytics}>
        <Ionicons name='analytics' size={24} color={colors.primary} />
        <Text style={styles.actionButtonText}>Analytics</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecentContent = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Content</Text>

      {/* Recent Tracks */}
      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Recent Tracks</Text>
        {recentTracks.map((track) => (
          <TouchableOpacity key={track.id} style={styles.contentItem}>
            <View style={styles.contentInfo}>
              <Text style={styles.contentTitle}>{track.title}</Text>
              <Text style={styles.contentStatus}>
                {track.status === 'published' ? 'Published' : 'Draft'}
              </Text>
            </View>
            <Text style={styles.contentStreams}>{formatNumber(track.streams)} streams</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Albums */}
      <View style={styles.subsection}>
        <Text style={styles.subsectionTitle}>Recent Albums</Text>
        {recentAlbums.map((album) => (
          <TouchableOpacity key={album.id} style={styles.contentItem}>
            <View style={styles.contentInfo}>
              <Text style={styles.contentTitle}>{album.title}</Text>
              <Text style={styles.contentTracks}>{album.tracks} tracks</Text>
            </View>
            <Text style={styles.contentStreams}>{formatNumber(album.streams)} streams</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size='large' color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {renderHeader()}

      {artistProfile && renderArtistInfo()}
      {renderQuickStats()}
      {renderActionButtons()}
      {renderRecentContent()}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    minWidth: 100,
    padding: spacing.lg,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  artistAvatar: {
    borderColor: colors.primary,
    borderRadius: radius.full,
    borderWidth: 3,
    height: 80,
    marginRight: spacing.lg,
    width: 80,
  },
  artistBio: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  artistDetails: {
    flex: 1,
  },
  artistInfoContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  artistLocation: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  artistName: {
    color: colors.text,
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  artistNameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  bottomSpacing: {
    height: 100,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  contentInfo: {
    flex: 1,
  },
  contentItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  contentStatus: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  contentStreams: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  contentTitle: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  contentTracks: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing['3xl'] : spacing.xl,
  },
  headerTitle: {
    color: colors.text,
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    minWidth: 80,
    padding: spacing.md,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  statNumber: {
    color: colors.text,
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  subsection: {
    marginBottom: spacing.xl,
  },
  subsectionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
});

export default ArtistPortalScreen;
