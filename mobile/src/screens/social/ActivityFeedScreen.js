import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';

// Theme
import { colors, spacing, typography, radius } from '../../styles/theme';

// Redux
import { loadActivityFeed, loadFriendsActivity } from '../../store/slices/socialSlice';

const { width } = Dimensions.get('window');

const ActivityFeedScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'friends', 'following'

  // Redux state
  const {
    activityFeed,
    friendsActivity,
    loading: socialLoading,
  } = useSelector((state) => state.social);

  useEffect(() => {
    loadActivities();
  }, [activeTab]);

  const loadActivities = async () => {
    try {
      if (activeTab === 'friends') {
        await dispatch(loadFriendsActivity());
      } else if (activeTab === 'following') {
        await dispatch(loadActivityFeed({ type: 'following' }));
      } else {
        await dispatch(loadActivityFeed());
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'playlist_created':
        return 'musical-notes';
      case 'track_liked':
        return 'heart';
      case 'artist_followed':
        return 'person-add';
      case 'track_shared':
        return 'share';
      case 'playlist_shared':
        return 'list';
      case 'album_shared':
        return 'disc';
      default:
        return 'notifications';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'playlist_created':
        return colors.primary;
      case 'track_liked':
        return colors.error;
      case 'artist_followed':
        return colors.success;
      case 'track_shared':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const renderActivityItem = ({ item }) => (
    <TouchableOpacity style={styles.activityItem}>
      <View style={styles.activityLeft}>
        <View
          style={[styles.activityIcon, { backgroundColor: getActivityColor(item.type) + '20' }]}
        >
          <Ionicons
            name={getActivityIcon(item.type)}
            size={20}
            color={getActivityColor(item.type)}
          />
        </View>
        <FastImage source={{ uri: item.user.avatar }} style={styles.userAvatar} />
      </View>

      <View style={styles.activityContent}>
        <Text style={styles.activityText}>
          <Text style={styles.userName}>{item.user.name}</Text> {item.content}
        </Text>
        <Text style={styles.activityTime}>{formatTimeAgo(new Date(item.timestamp))}</Text>
      </View>

      {item.track && (
        <TouchableOpacity style={styles.trackPreview}>
          <FastImage source={{ uri: item.track.artwork }} style={styles.trackArtwork} />
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle} numberOfLines={1}>
              {item.track.title}
            </Text>
            <Text style={styles.trackArtist} numberOfLines={1}>
              {item.track.artist}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    }
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    return `${diffInDays}d ago`;
  };

  const getCurrentActivities = () => {
    switch (activeTab) {
      case 'friends':
        return friendsActivity.activities || [];
      case 'following':
        return activityFeed.activities?.filter((activity) => activity.type === 'following') || [];
      default:
        return activityFeed.activities || [];
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name='arrow-back' size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Activity</Text>
      <View style={styles.headerRight} />
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabs}>
      {[
        { key: 'all', label: 'All' },
        { key: 'friends', label: 'Friends' },
        { key: 'following', label: 'Following' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => setActiveTab(tab.key)}
        >
          <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const activities = getCurrentActivities();
  const loading = activeTab === 'friends' ? friendsActivity.isLoading : activityFeed.isLoading;

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderTabs()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading activities...</Text>
        </View>
      ) : activities.length > 0 ? (
        <FlatList
          data={activities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name='notifications-off-outline' size={64} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No activity yet</Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'friends'
              ? 'Follow friends to see their activity'
              : activeTab === 'following'
              ? 'Follow users to see their activity'
              : 'Activity from your network will appear here'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: colors.primary,
  },
  activeTabText: {
    color: colors.text,
  },
  activityContent: {
    flex: 1,
  },
  activityIcon: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 32,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    width: 32,
  },
  activityItem: {
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
  },
  activityLeft: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityText: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  activityTime: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
    lineHeight: 24,
    textAlign: 'center',
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing['3xl'] : spacing.xl,
  },
  headerRight: {
    width: 24,
  },
  headerTitle: {
    color: colors.text,
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
  },
  list: {
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
  },
  tab: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flex: 1,
    marginHorizontal: spacing.xs,
    paddingVertical: spacing.md,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  trackArtist: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  trackArtwork: {
    borderRadius: radius.sm,
    height: 40,
    marginRight: spacing.sm,
    width: 40,
  },
  trackInfo: {
    flex: 1,
  },
  trackPreview: {
    alignItems: 'center',
    backgroundColor: colors.elevated,
    borderRadius: radius.md,
    flexDirection: 'row',
    marginTop: spacing.sm,
    maxWidth: width * 0.6,
    padding: spacing.sm,
  },
  trackTitle: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  userAvatar: {
    borderColor: colors.background,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 24,
    width: 24,
  },
  userName: {
    color: colors.text,
    fontWeight: '600',
  },
});

export default ActivityFeedScreen;
