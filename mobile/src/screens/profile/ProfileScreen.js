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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';

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

// Redux
import { addRecentActivity } from '../../store/slices/personalizationSlice';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Redux state
  const currentUser = useSelector((state) => state.auth.user);
  const { recentActivities } = useSelector((state) => state.personalization);

  // State for user profile and content
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState({
    totalTracks: 0,
    totalPlaylists: 0,
    totalAlbums: 0,
    totalArtists: 0,
    totalMinutes: 0,
  });

  // Social features state
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [userAlbums, setUserAlbums] = useState([]);
  const [userArtists, setUserArtists] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);

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
        loadActivityFeed(),
        loadSocialData(),
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

  const loadSocialData = async () => {
    try {
      // Mock social data - replace with actual API calls
      setFollowers([
        {
          id: '1',
          name: 'Alice Johnson',
          avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        },
        {
          id: '2',
          name: 'Bob Smith',
          avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
        },
      ]);
      setFollowing([
        {
          id: '1',
          name: 'Charlie Brown',
          avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        },
        {
          id: '2',
          name: 'Diana Prince',
          avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        },
      ]);
      setFollowersCount(1234);
      setFollowingCount(567);
      setIsFollowing(false); // Current user viewing their own profile
    } catch (error) {
      console.error('Error loading social data:', error);
    }
  };

  const loadActivityFeed = async () => {
    try {
      // Mock activity feed - replace with actual API calls
      setActivityFeed([
        {
          id: '1',
          type: 'playlist_created',
          user: {
            name: 'John Doe',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          },
          content: 'Created playlist "Chill Vibes"',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        },
        {
          id: '2',
          type: 'track_liked',
          user: {
            name: 'John Doe',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          },
          content: 'Liked "Blinding Lights" by The Weeknd',
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        },
        {
          id: '3',
          type: 'artist_followed',
          user: {
            name: 'John Doe',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          },
          content: 'Started following Taylor Swift',
          timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        },
      ]);
    } catch (error) {
      console.error('Error loading activity feed:', error);
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
    Alert.alert('Logout', 'Are you sure you want to logout?', [
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
    ]);
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
    <TrackCard track={item} onPress={() => handleTrackPress(item)} />
  );

  const renderPlaylistItem = ({ item }) => (
    <PlaylistCard playlist={item} onPress={() => handlePlaylistPress(item)} />
  );

  const renderAlbumItem = ({ item }) => (
    <AlbumCard album={item} onPress={() => handleAlbumPress(item)} />
  );

  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <FastImage source={{ uri: item.user.avatar }} style={styles.activityAvatar} />
      <View style={styles.activityContent}>
        <Text style={styles.activityText}>
          <Text style={styles.activityUser}>{item.user.name}</Text> {item.content}
        </Text>
        <Text style={styles.activityTime}>{formatTimeAgo(new Date(item.timestamp))}</Text>
      </View>
    </View>
  );

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInMinutes < 1) {
      return 'Just now';
    }
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const ProfileHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Ionicons name='menu' size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
          <Ionicons name='settings-outline' size={20} color={colors.text} />
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
            <MaterialIcons name='star' size={16} color={colors.secondary} />
          </View>
        )}
      </View>

      <View style={styles.userDetails}>
        <Text style={styles.userName}>{userProfile?.name}</Text>
        <Text style={styles.username}>@{userProfile?.username}</Text>

        {userProfile?.bio && <Text style={styles.bio}>{userProfile.bio}</Text>}

        <View style={styles.userMeta}>
          {userProfile?.location && (
            <View style={styles.metaItem}>
              <Ionicons name='location-outline' size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>{userProfile.location}</Text>
            </View>
          )}

          {userProfile?.website && (
            <View style={styles.metaItem}>
              <Ionicons name='link' size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>{userProfile.website}</Text>
            </View>
          )}

          <View style={styles.metaItem}>
            <Ionicons name='calendar-outline' size={16} color={colors.textSecondary} />
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
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
        <LoadingSpinner size='large' />
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
        <ProfileHeader />

        {/* User Info */}
        {userProfile && <UserInfo />}

        {/* Listening Stats */}
        <ListeningStats />

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title='Recently Played'
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
            <SectionHeader title='Top Tracks' onSeeAll={() => navigation.navigate('TopTracks')} />
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
            <SectionHeader title='Top Artists' onSeeAll={() => navigation.navigate('TopArtists')} />
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
            <SectionHeader title='Top Albums' onSeeAll={() => navigation.navigate('TopAlbums')} />
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

        {/* Activity Feed */}
        {activityFeed.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title='Recent Activity'
              onSeeAll={() => navigation.navigate('ActivityFeed')}
            />
            <FlatList
              data={activityFeed}
              renderItem={renderActivityItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.activityList}
            />
          </View>
        )}

        {/* Followers/Following Preview */}
        <View style={styles.section}>
          <SectionHeader title='Social' onSeeAll={() => navigation.navigate('SocialOverview')} />
          <View style={styles.socialPreview}>
            <TouchableOpacity style={styles.socialItem}>
              <Text style={styles.socialNumber}>{formatNumber(followersCount)}</Text>
              <Text style={styles.socialLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialItem}>
              <Text style={styles.socialNumber}>{formatNumber(followingCount)}</Text>
              <Text style={styles.socialLabel}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  activityAvatar: {
    borderRadius: radius.full,
    height: 32,
    marginRight: spacing.md,
    width: 32,
  },
  activityContent: {
    flex: 1,
  },
  activityItem: {
    alignItems: 'flex-start',
    backgroundColor: colors.white10,
    borderRadius: radius.md,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  activityList: {
    paddingHorizontal: spacing.lg,
  },
  activityText: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  activityTime: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  activityUser: {
    color: colors.text,
    fontWeight: '600',
  },
  avatar: {
    borderColor: colors.primary,
    borderRadius: radius['3xl'],
    borderWidth: 3,
    height: 120,
    width: 120,
  },
  avatarContainer: {
    marginBottom: spacing.lg,
    position: 'relative',
  },
  bio: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    lineHeight: 24,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    flex: 1,
    marginRight: spacing.sm,
    paddingVertical: spacing.md,
  },
  editButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  followLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  followNumber: {
    color: colors.text,
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  followStat: {
    alignItems: 'center',
    marginHorizontal: spacing.lg,
  },
  followStats: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
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
  headerCenter: {
    alignItems: 'center',
    flex: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    flex: 1,
  },
  headerTitle: {
    color: colors.text,
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    letterSpacing: 2,
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
  logoutButton: {
    alignItems: 'center',
    backgroundColor: colors.white10,
    borderRadius: radius.lg,
    flex: 1,
    marginLeft: spacing.sm,
    paddingVertical: spacing.md,
  },
  logoutButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  menuButton: {
    padding: spacing.sm,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginLeft: spacing.xs,
  },
  premiumBadge: {
    backgroundColor: colors.background,
    borderRadius: radius.full,
    bottom: 0,
    padding: 4,
    position: 'absolute',
    right: 0,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  settingsButton: {
    padding: spacing.sm,
  },
  socialItem: {
    alignItems: 'center',
    backgroundColor: colors.white10,
    borderRadius: radius.md,
    flex: 1,
    marginHorizontal: spacing.xs,
    padding: spacing.md,
  },
  socialLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  socialNumber: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  socialPreview: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: colors.white10,
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
    marginBottom: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  userDetails: {
    alignItems: 'center',
    width: '100%',
  },
  userInfoContainer: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  userMeta: {
    marginBottom: spacing.lg,
    width: '100%',
  },
  userName: {
    color: colors.text,
    fontSize: typography.fontSize['3xl'],
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  username: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.lg,
    marginBottom: spacing.md,
  },
});

export default ProfileScreen;
