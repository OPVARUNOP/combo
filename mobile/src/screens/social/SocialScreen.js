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
import TrackCard from '../components/cards/TrackCard';
import PlaylistCard from '../components/cards/PlaylistCard';
import AlbumCard from '../components/cards/AlbumCard';
import ArtistCard from '../components/cards/ArtistCard';
import SectionHeader from '../components/common/SectionHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Services
import { socialAPI, trackAPI, playlistAPI, userAPI } from '../services/api';

// Theme
import { colors, spacing, typography, radius } from '../styles/theme';

const { width } = Dimensions.get('window');

const SocialScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // State for different sections
  const [feed, setFeed] = useState([]);
  const [friendsActivity, setFriendsActivity] = useState([]);
  const [sharedContent, setSharedContent] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadFeed(),
        loadFriendsActivity(),
        loadSharedContent(),
        loadFollowers(),
        loadFollowing(),
        loadSuggestedUsers(),
      ]);
    } catch (error) {
      console.error('Error loading social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeed = async () => {
    try {
      const response = await socialAPI.getFeed({ limit: 20 });
      setFeed(response.data.feed || []);
    } catch (error) {
      console.error('Error loading feed:', error);
    }
  };

  const loadFriendsActivity = async () => {
    try {
      const response = await socialAPI.getFriendsActivity({ limit: 10 });
      setFriendsActivity(response.data.activity || []);
    } catch (error) {
      console.error('Error loading friends activity:', error);
    }
  };

  const loadSharedContent = async () => {
    try {
      const response = await socialAPI.getSharedContent({ limit: 10 });
      setSharedContent(response.data.shared || []);
    } catch (error) {
      console.error('Error loading shared content:', error);
    }
  };

  const loadFollowers = async () => {
    try {
      const response = await userAPI.getFollowers();
      setFollowers(response.data.followers || []);
    } catch (error) {
      console.error('Error loading followers:', error);
    }
  };

  const loadFollowing = async () => {
    try {
      const response = await userAPI.getFollowing();
      setFollowing(response.data.following || []);
    } catch (error) {
      console.error('Error loading following:', error);
    }
  };

  const loadSuggestedUsers = async () => {
    try {
      // Mock data for now - replace with actual API call
      setSuggestedUsers([
        {
          id: '1',
          name: 'Alice Johnson',
          username: 'alicej',
          avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
          isFollowing: false,
          mutualFriends: 3,
        },
        {
          id: '2',
          name: 'Bob Smith',
          username: 'bobsmith',
          avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
          isFollowing: false,
          mutualFriends: 1,
        },
        {
          id: '3',
          name: 'Carol Davis',
          username: 'carold',
          avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
          isFollowing: false,
          mutualFriends: 5,
        },
      ]);
    } catch (error) {
      console.error('Error loading suggested users:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSocialData();
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

  const handleUserPress = (user) => {
    navigation.navigate('UserProfile', { user });
  };

  const handleFollowUser = async (userId) => {
    try {
      await socialAPI.followUser(userId);
      // Update local state
      const updatedSuggestedUsers = suggestedUsers.map((user) =>
        user.id === userId ? { ...user, isFollowing: true } : user,
      );
      setSuggestedUsers(updatedSuggestedUsers);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleShareTrack = (track) => {
    // Implement sharing functionality
    console.log('Sharing track:', track);
  };

  const handleSharePlaylist = (playlist) => {
    // Implement sharing functionality
    console.log('Sharing playlist:', playlist);
  };

  const renderFeedItem = ({ item }) => {
    const renderContent = () => {
      switch (item.type) {
        case 'track':
          return <TrackCard track={item.content} onPress={() => handleTrackPress(item.content)} />;
        case 'playlist':
          return (
            <PlaylistCard
              playlist={item.content}
              onPress={() => handlePlaylistPress(item.content)}
            />
          );
        case 'album':
          return <AlbumCard album={item.content} onPress={() => handleAlbumPress(item.content)} />;
        case 'artist':
          return (
            <ArtistCard artist={item.content} onPress={() => handleArtistPress(item.content)} />
          );
        default:
          return null;
      }
    };

    return (
      <View style={styles.feedItem}>
        <View style={styles.feedHeader}>
          <TouchableOpacity style={styles.userInfo} onPress={() => handleUserPress(item.user)}>
            <FastImage source={{ uri: item.user.avatar }} style={styles.userAvatar} />
            <View>
              <Text style={styles.userName}>{item.user.name}</Text>
              <Text style={styles.activityText}>{item.activity}</Text>
              <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleDateString()}</Text>
            </View>
          </TouchableOpacity>
        </View>
        {renderContent()}
      </View>
    );
  };

  const renderFriendsActivityItem = ({ item }) => (
    <TouchableOpacity style={styles.activityItem} onPress={() => handleUserPress(item.user)}>
      <FastImage source={{ uri: item.user.avatar }} style={styles.activityAvatar} />
      <View style={styles.activityContent}>
        <Text style={styles.activityUserName}>{item.user.name}</Text>
        <Text style={styles.activityText}>{item.activity}</Text>
        <Text style={styles.activityTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSuggestedUserItem = ({ item }) => (
    <View style={styles.suggestedUserItem}>
      <TouchableOpacity style={styles.suggestedUserInfo} onPress={() => handleUserPress(item)}>
        <FastImage source={{ uri: item.avatar }} style={styles.suggestedUserAvatar} />
        <View style={styles.suggestedUserDetails}>
          <Text style={styles.suggestedUserName}>{item.name}</Text>
          <Text style={styles.suggestedUserUsername}>@{item.username}</Text>
          {item.mutualFriends > 0 && (
            <Text style={styles.mutualFriendsText}>{item.mutualFriends} mutual friends</Text>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.followButton, item.isFollowing && styles.followingButton]}
        onPress={() => handleFollowUser(item.id)}
        disabled={item.isFollowing}
      >
        <Text style={[styles.followButtonText, item.isFollowing && styles.followingButtonText]}>
          {item.isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const SocialHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Ionicons name='menu' size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>Social</Text>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.searchButton} onPress={() => navigation.navigate('Search')}>
          <Ionicons name='search' size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('InviteFriends')}
        >
          <Ionicons name='person-add' size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const SocialStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{followers.length}</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </View>

      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{following.length}</Text>
        <Text style={styles.statLabel}>Following</Text>
      </View>

      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{feed.length}</Text>
        <Text style={styles.statLabel}>Posts</Text>
      </View>

      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{friendsActivity.length}</Text>
        <Text style={styles.statLabel}>Activity</Text>
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
        <SocialHeader />

        {/* Social Stats */}
        <SocialStats />

        {/* Friends Activity */}
        {friendsActivity.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title='Friends Activity'
              onSeeAll={() => navigation.navigate('FriendsActivity')}
            />
            <FlatList
              data={friendsActivity}
              renderItem={renderFriendsActivityItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Social Feed */}
        {feed.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title='Feed' onSeeAll={() => navigation.navigate('FullFeed')} />
            <FlatList
              data={feed}
              renderItem={renderFeedItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Suggested Users */}
        {suggestedUsers.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title='People You May Know'
              onSeeAll={() => navigation.navigate('DiscoverPeople')}
            />
            <FlatList
              data={suggestedUsers}
              renderItem={renderSuggestedUserItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Shared Content */}
        {sharedContent.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title='Shared with You'
              onSeeAll={() => navigation.navigate('SharedContent')}
            />
            <FlatList
              data={sharedContent}
              renderItem={({ item }) => (
                <TrackCard track={item} onPress={() => handleTrackPress(item)} />
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Followers/Following Preview */}
        {(followers.length > 0 || following.length > 0) && (
          <View style={styles.section}>
            <SectionHeader
              title='Connections'
              onSeeAll={() => navigation.navigate('Connections')}
            />
            <View style={styles.connectionsContainer}>
              {followers.length > 0 && (
                <View style={styles.connectionGroup}>
                  <Text style={styles.connectionTitle}>Followers ({followers.length})</Text>
                  <FlatList
                    data={followers.slice(0, 5)}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.connectionItem}
                        onPress={() => handleUserPress(item)}
                      >
                        <FastImage source={{ uri: item.avatar }} style={styles.connectionAvatar} />
                        <Text style={styles.connectionName}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  />
                </View>
              )}

              {following.length > 0 && (
                <View style={styles.connectionGroup}>
                  <Text style={styles.connectionTitle}>Following ({following.length})</Text>
                  <FlatList
                    data={following.slice(0, 5)}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.connectionItem}
                        onPress={() => handleUserPress(item)}
                      >
                        <FastImage source={{ uri: item.avatar }} style={styles.connectionAvatar} />
                        <Text style={styles.connectionName}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  />
                </View>
              )}
            </View>
          </View>
        )}

        {/* Empty State */}
        {feed.length === 0 &&
          friendsActivity.length === 0 &&
          suggestedUsers.length === 0 &&
          sharedContent.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name='people-outline' size={64} color={colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>Connect with friends</Text>
              <Text style={styles.emptyStateSubtitle}>
                Follow people to see their music activity and share your favorites
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('InviteFriends')}
              >
                <Text style={styles.emptyStateButtonText}>Find Friends</Text>
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
  activityAvatar: {
    borderRadius: radius.full,
    height: 50,
    marginRight: spacing.md,
    width: 50,
  },
  activityContent: {
    flex: 1,
  },
  activityItem: {
    alignItems: 'center',
    borderBottomColor: colors.white10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  activityText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginBottom: 2,
  },
  activityTime: {
    color: colors.textDisabled,
    fontSize: typography.fontSize.xs,
  },
  activityUserName: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: 2,
  },
  addButton: {
    padding: spacing.sm,
  },
  bottomSpacing: {
    height: 100,
  },
  connectionAvatar: {
    borderRadius: radius.full,
    height: 60,
    marginBottom: spacing.sm,
    width: 60,
  },
  connectionGroup: {
    marginBottom: spacing.lg,
  },
  connectionItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
    minWidth: 80,
  },
  connectionName: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  connectionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  connectionsContainer: {
    paddingHorizontal: spacing.lg,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['4xl'],
    paddingTop: spacing['4xl'],
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  emptyStateButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  emptyStateSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
    lineHeight: 24,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  emptyStateTitle: {
    color: colors.text,
    fontSize: typography.fontSize['2xl'],
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  feedHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  feedItem: {
    borderBottomColor: colors.white10,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  followButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  followButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  followingButton: {
    backgroundColor: colors.white10,
  },
  followingButtonText: {
    color: colors.text,
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
    paddingTop: spacing['3xl'],
  },
  headerCenter: {
    alignItems: 'center',
    flex: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
  menuButton: {
    padding: spacing.sm,
  },
  mutualFriendsText: {
    color: colors.textDisabled,
    fontSize: typography.fontSize.xs,
  },
  searchButton: {
    marginRight: spacing.sm,
    padding: spacing.sm,
  },
  section: {
    marginBottom: spacing['2xl'],
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
  suggestedUserAvatar: {
    borderRadius: radius.full,
    height: 50,
    marginRight: spacing.md,
    width: 50,
  },
  suggestedUserDetails: {
    flex: 1,
  },
  suggestedUserInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  suggestedUserItem: {
    alignItems: 'center',
    backgroundColor: colors.white10,
    borderRadius: radius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginRight: spacing.md,
    padding: spacing.md,
  },
  suggestedUserName: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestedUserUsername: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginBottom: 2,
  },
  timestamp: {
    color: colors.textDisabled,
    fontSize: typography.fontSize.xs,
  },
  userAvatar: {
    borderRadius: radius.full,
    height: 40,
    marginRight: spacing.md,
    width: 40,
  },
  userInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  userName: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: 2,
  },
});

export default SocialScreen;
