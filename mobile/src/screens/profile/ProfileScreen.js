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
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';

// Components
import TrackCard from '../components/cards/TrackCard';
import PlaylistCard from '../components/cards/PlaylistCard';
import AlbumCard from '../components/cards/AlbumCard';
import ArtistCard from '../components/cards/ArtistCard';
import SectionHeader from '../components/common/SectionHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Services
import { userAPI, trackAPI, playlistAPI, albumAPI, artistAPI } from '../services/api';

// Theme
import { colors, spacing, typography, radius } from '../styles/theme';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // State for user profile and content
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState({
    totalTracks: 0,
    totalPlaylists: 0,
    totalAlbums: 0,
    totalArtists: 0,
    totalMinutes: 0,
  });
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);
  const [createdPlaylists, setCreatedPlaylists] = useState([]);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUserProfile(),
        loadUserStats(),
        loadRecentlyPlayed(),
        loadTopTracks(),
        loadTopArtists(),
        loadTopAlbums(),
        loadCreatedPlaylists(),
      ]);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setUserProfile(response.data.user);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Mock data for now
      setUserProfile({
        id: '1',
        name: 'John Doe',
        username: 'johndoe',
        email: 'john.doe@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        bio: 'Music lover and playlist curator',
        location: 'New York, NY',
        website: 'https://johndoe.com',
        joinedDate: '2020-01-15',
        isPremium: true,
        followersCount: 1234,
        followingCount: 567,
      });
    }
  };

  const loadUserStats = async () => {
    try {
      // Mock data for now - replace with actual API call
      setUserStats({
        totalTracks: 1250,
        totalPlaylists: 45,
        totalAlbums: 89,
        totalArtists: 156,
        totalMinutes: 45678,
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
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

  const loadTopTracks = async () => {
    try {
      const response = await trackAPI.getAll({ limit: 10, sort: 'plays' });
      setTopTracks(response.data.tracks || []);
    } catch (error) {
      console.error('Error loading top tracks:', error);
    }
  };

  const loadTopArtists = async () => {
    try {
      const response = await artistAPI.getAll({ limit: 10, sort: 'plays' });
      setTopArtists(response.data.artists || []);
    } catch (error) {
      console.error('Error loading top artists:', error);
    }
  };

  const loadTopAlbums = async () => {
    try {
      const response = await albumAPI.getAll({ limit: 10, sort: 'plays' });
      setTopAlbums(response.data.albums || []);
    } catch (error) {
      console.error('Error loading top albums:', error);
    }
  };

  const loadCreatedPlaylists = async () => {
    try {
      const response = await playlistAPI.getMyPlaylists();
      setCreatedPlaylists(response.data.playlists || []);
    } catch (error) {
      console.error('Error loading created playlists:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
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

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Implement logout logic
            console.log('User logged out');
          },
        },
      ]
    );
  };

  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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

  const ProfileHeader = () => (
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
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettings}
        >
          <Ionicons name="settings-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const UserInfo = () => (
    <View style={styles.userInfoContainer}>
      <View style={styles.avatarContainer}>
        <FastImage source={{ uri: userProfile?.avatar }} style={styles.avatar} />
        {userProfile?.isPremium && (
          <View style={styles.premiumBadge}>
            <MaterialIcons name="star" size={16} color={colors.secondary} />
          </View>
        )}
      </View>

      <View style={styles.userDetails}>
        <Text style={styles.userName}>{userProfile?.name}</Text>
        <Text style={styles.username}>@{userProfile?.username}</Text>

        {userProfile?.bio && (
          <Text style={styles.bio}>{userProfile.bio}</Text>
        )}

        <View style={styles.userMeta}>
          {userProfile?.location && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>{userProfile.location}</Text>
            </View>
          )}

          {userProfile?.website && (
            <View style={styles.metaItem}>
              <Ionicons name="link" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>{userProfile.website}</Text>
            </View>
          )}

          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              Joined {new Date(userProfile?.joinedDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.followStats}>
          <TouchableOpacity style={styles.followStat}>
            <Text style={styles.followNumber}>
              {formatNumber(userProfile?.followersCount || 0)}
            </Text>
            <Text style={styles.followLabel}>Followers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.followStat}>
            <Text style={styles.followNumber}>
              {formatNumber(userProfile?.followingCount || 0)}
            </Text>
            <Text style={styles.followLabel}>Following</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const ListeningStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{formatNumber(userStats.totalTracks)}</Text>
        <Text style={styles.statLabel}>Tracks</Text>
      </View>

      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{formatNumber(userStats.totalMinutes)}</Text>
        <Text style={styles.statLabel}>Minutes</Text>
      </View>

      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{userStats.totalPlaylists}</Text>
        <Text style={styles.statLabel}>Playlists</Text>
      </View>

      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{userStats.totalArtists}</Text>
        <Text style={styles.statLabel}>Artists</Text>
      </View>
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
        <ProfileHeader />

        {/* User Info */}
        {userProfile && <UserInfo />}

        {/* Listening Stats */}
        <ListeningStats />

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

        {/* Top Tracks */}
        {topTracks.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Top Tracks"
              onSeeAll={() => navigation.navigate('TopTracks')}
            />
            <FlatList
              data={topTracks}
              renderItem={renderTrackItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Top Artists */}
        {topArtists.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Top Artists"
              onSeeAll={() => navigation.navigate('TopArtists')}
            />
            <FlatList
              data={topArtists}
              renderItem={renderArtistItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Top Albums */}
        {topAlbums.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Top Albums"
              onSeeAll={() => navigation.navigate('TopAlbums')}
            />
            <FlatList
              data={topAlbums}
              renderItem={renderAlbumItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Created Playlists */}
        {createdPlaylists.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Your Playlists"
              onSeeAll={() => navigation.navigate('MyPlaylists')}
            />
            <FlatList
              data={createdPlaylists}
              renderItem={renderPlaylistItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
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
    paddingTop: Platform.OS === 'ios' ? spacing['3xl'] : spacing.xl,
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
    alignItems: 'flex-end',
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
  settingsButton: {
    padding: spacing.sm,
  },
  userInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: radius['3xl'],
    borderWidth: 3,
    borderColor: colors.primary,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    padding: 4,
  },
  userDetails: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  username: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  bio: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  userMeta: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    justifyContent: 'center',
  },
  metaText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  followStats: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  followStat: {
    alignItems: 'center',
    marginHorizontal: spacing.lg,
  },
  followNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  followLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  editButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: '600',
  },
  logoutButton: {
    flex: 1,
    backgroundColor: colors.white10,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  logoutButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: '600',
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
  bottomSpacing: {
    height: 100,
  },
});

export default ProfileScreen;
