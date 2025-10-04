import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';

// Theme
import { colors, spacing, typography, radius } from '../../styles/theme';

// Redux
import {
  searchUsers,
  followUser,
  unfollowUser,
  loadSuggestedUsers,
} from '../../store/slices/socialSlice';

const SearchUsersScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Redux state
  const { suggestedUsers, userConnections } = useSelector((state) => state.social);
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    loadSuggestedUsers();
  }, []);

  const loadSuggestedUsers = async () => {
    try {
      await dispatch(loadSuggestedUsers());
    } catch (error) {
      console.error('Error loading suggested users:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setIsSearching(true);
    try {
      await dispatch(searchUsers(searchQuery.trim()));
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await dispatch(followUser(userId));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await dispatch(unfollowUser(userId));
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSuggestedUsers();
    setRefreshing(false);
  };

  const isFollowing = (userId) => {
    return userConnections.following?.some((user) => user.id === userId) || false;
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <TouchableOpacity
        style={styles.userInfo}
        onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
      >
        <FastImage source={{ uri: item.avatar }} style={styles.userAvatar} />
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.username}>@{item.username}</Text>
          {item.bio && (
            <Text style={styles.userBio} numberOfLines={2}>
              {item.bio}
            </Text>
          )}
          <View style={styles.userStats}>
            <Text style={styles.userStat}>{item.followersCount || 0} followers</Text>
            <Text style={styles.userStat}>{item.followingCount || 0} following</Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.followButton, isFollowing(item.id) && styles.followingButton]}
        onPress={() => {
          if (isFollowing(item.id)) {
            handleUnfollow(item.id);
          } else {
            handleFollow(item.id);
          }
        }}
      >
        <Text style={[styles.followButtonText, isFollowing(item.id) && styles.followingButtonText]}>
          {isFollowing(item.id) ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name='arrow-back' size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Find Users</Text>
      <View style={styles.headerRight} />
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name='search' size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder='Search users...'
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType='search'
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name='close-circle' size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
        onPress={handleSearch}
        disabled={isSearching}
      >
        <Text style={styles.searchButtonText}>{isSearching ? 'Searching...' : 'Search'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSectionHeader = (title) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const users =
    searchQuery.length > 0
      ? suggestedUsers.users?.filter(
          (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username.toLowerCase().includes(searchQuery.toLowerCase()),
        ) || []
      : suggestedUsers.users || [];

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name='people-outline' size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>
              {searchQuery.length > 0 ? 'No users found' : 'No suggested users'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.length > 0
                ? 'Try searching for a different username'
                : 'Suggested users will appear here'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
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
  followButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  followButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  followingButton: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  followingButtonText: {
    color: colors.primary,
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
  searchButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  searchButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  searchButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  searchContainer: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: typography.fontSize.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  searchInputContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  userAvatar: {
    borderColor: colors.primary,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 50,
    marginRight: spacing.md,
    width: 50,
  },
  userBio: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  userDetails: {
    flex: 1,
  },
  userInfo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  userItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  userName: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  userStat: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    marginRight: spacing.lg,
  },
  userStats: {
    flexDirection: 'row',
  },
  username: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
});

export default SearchUsersScreen;
