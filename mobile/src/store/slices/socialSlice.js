import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { socialAPI, userAPI, trackAPI, playlistAPI } from '../services/api';

// Async thunks for social feed
export const loadSocialFeed = createAsyncThunk(
  'social/loadFeed',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await socialAPI.getFeed(params);
      return {
        posts: response.data.feed || [],
        total: response.data.total || 0,
        hasMore: response.data.hasMore || false,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load social feed');
    }
  },
);

export const createPost = createAsyncThunk(
  'social/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await socialAPI.createPost(postData);
      return response.data.post;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  },
);

export const likePost = createAsyncThunk('social/likePost', async (postId, { rejectWithValue }) => {
  try {
    await socialAPI.likePost(postId);
    return postId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to like post');
  }
});

export const followUser = createAsyncThunk(
  'social/followUser',
  async (userId, { rejectWithValue }) => {
    try {
      await socialAPI.followUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to follow user');
    }
  },
);

export const unfollowUser = createAsyncThunk(
  'social/unfollowUser',
  async (userId, { rejectWithValue }) => {
    try {
      await socialAPI.unfollowUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unfollow user');
    }
  },
);

export const loadUserFollowers = createAsyncThunk(
  'social/loadUserFollowers',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await socialAPI.getUserFollowers(userId);
      return response.data.followers || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load followers');
    }
  },
);

export const loadUserFollowing = createAsyncThunk(
  'social/loadUserFollowing',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await socialAPI.getUserFollowing(userId);
      return response.data.following || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load following');
    }
  },
);

export const unlikePost = createAsyncThunk(
  'social/unlikePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await socialAPI.unlikePost(postId);
      return response.data.post;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unlike post');
    }
  },
);

export const commentOnPost = createAsyncThunk(
  'social/commentOnPost',
  async ({ postId, comment }, { rejectWithValue }) => {
    try {
      const response = await socialAPI.commentOnPost(postId, comment);
      return { postId, comment: response.data.comment };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to comment on post');
    }
  },
);

// Async thunks for friends activity
export const loadFriendsActivity = createAsyncThunk(
  'social/loadFriendsActivity',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await socialAPI.getFriendsActivity(params);
      return response.data.activity || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load friends activity');
    }
  },
);

export const loadActivityFeed = createAsyncThunk(
  'social/loadActivityFeed',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await socialAPI.getActivityFeed(params);
      return response.data.activities || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load activity feed');
    }
  },
);

// Async thunks for user connections
export const loadSuggestedUsers = createAsyncThunk(
  'social/loadSuggestedUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await userAPI.getSuggestedUsers(params);
      return response.data.users || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load suggested users');
    }
  },
);

export const loadUserConnections = createAsyncThunk(
  'social/loadUserConnections',
  async (userId, { rejectWithValue }) => {
    try {
      const [followersRes, followingRes] = await Promise.allSettled([
        userAPI.getFollowers({ userId }),
        userAPI.getFollowing({ userId }),
      ]);

      return {
        followers:
          followersRes.status === 'fulfilled' ? followersRes.value.data.followers || [] : [],
        following:
          followingRes.status === 'fulfilled' ? followingRes.value.data.following || [] : [],
      };
    } catch (error) {
      return rejectWithValue('Failed to load user connections');
    }
  },
);

// Async thunks for sharing
export const shareTrack = createAsyncThunk(
  'social/shareTrack',
  async ({ trackId, message, visibility }, { rejectWithValue }) => {
    try {
      const response = await socialAPI.shareTrack(trackId, {
        message,
        visibility,
      });
      return response.data.share;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to share track');
    }
  },
);

export const sharePlaylist = createAsyncThunk(
  'social/sharePlaylist',
  async ({ playlistId, message, visibility }, { rejectWithValue }) => {
    try {
      const response = await socialAPI.sharePlaylist(playlistId, {
        message,
        visibility,
      });
      return response.data.share;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to share playlist');
    }
  },
);

export const shareAlbum = createAsyncThunk(
  'social/shareAlbum',
  async ({ albumId, message, visibility }, { rejectWithValue }) => {
    try {
      const response = await socialAPI.shareAlbum(albumId, {
        message,
        visibility,
      });
      return response.data.share;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to share album');
    }
  },
);

// Async thunks for notifications
export const loadNotifications = createAsyncThunk(
  'social/loadNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await socialAPI.getNotifications(params);
      return {
        notifications: response.data.notifications || [],
        total: response.data.total || 0,
        unreadCount: response.data.unreadCount || 0,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load notifications');
    }
  },
);

export const markNotificationAsRead = createAsyncThunk(
  'social/markNotificationAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await socialAPI.markAsRead(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark notification as read',
      );
    }
  },
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'social/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await socialAPI.markAllAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark all notifications as read',
      );
    }
  },
);

const initialState = {
  // Social feed
  feed: {
    posts: [],
    total: 0,
    hasMore: false,
    isLoading: false,
    lastFetched: null,
  },

  // Friends activity
  friendsActivity: {
    activities: [],
    isLoading: false,
    error: null,
  },

  // Activity feed
  activityFeed: {
    activities: [],
    isLoading: false,
    error: null,
  },

  // Suggested users
  suggestedUsers: {
    users: [],
    isLoading: false,
    error: null,
  },

  // User connections
  userConnections: {
    followers: [],
    following: [],
    isLoading: false,
    error: null,
  },

  // Notifications
  notifications: {
    list: [],
    total: 0,
    unreadCount: 0,
    isLoading: false,
    error: null,
  },

  // Sharing
  shares: {
    recentShares: [],
    isLoading: false,
    error: null,
  },

  // UI state
  isLoading: false,
  error: null,
  activeTab: 'feed', // 'feed', 'activity', 'notifications', 'connections'

  // Social settings
  socialSettings: {
    autoRefreshFeed: true,
    showReadNotifications: false,
    notificationFrequency: 'normal', // 'low', 'normal', 'high'
    activityVisibility: 'friends', // 'public', 'friends', 'private'
    allowTagging: true,
    allowMentions: true,
  },
};

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    updateSocialSettings: (state, action) => {
      state.socialSettings = { ...state.socialSettings, ...action.payload };
    },
    addPost: (state, action) => {
      state.feed.posts.unshift(action.payload);
      state.feed.total += 1;
    },
    updatePost: (state, action) => {
      const { postId, updates } = action.payload;
      const postIndex = state.feed.posts.findIndex((p) => p.id === postId);
      if (postIndex !== -1) {
        state.feed.posts[postIndex] = {
          ...state.feed.posts[postIndex],
          ...updates,
        };
      }
    },
    removePost: (state, action) => {
      const postId = action.payload;
      state.feed.posts = state.feed.posts.filter((p) => p.id !== postId);
      state.feed.total = Math.max(0, state.feed.total - 1);
    },
    addActivity: (state, action) => {
      state.friendsActivity.activities.unshift(action.payload);
    },
    updateNotification: (state, action) => {
      const { notificationId, updates } = action.payload;
      const notificationIndex = state.notifications.list.findIndex((n) => n.id === notificationId);
      if (notificationIndex !== -1) {
        state.notifications.list[notificationIndex] = {
          ...state.notifications.list[notificationIndex],
          ...updates,
        };
      }
    },
    markNotificationRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.list.find((n) => n.id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.notifications.unreadCount = Math.max(0, state.notifications.unreadCount - 1);
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.list.forEach((notification) => {
        notification.isRead = true;
      });
      state.notifications.unreadCount = 0;
    },
    addNotification: (state, action) => {
      const notification = action.payload;
      state.notifications.list.unshift(notification);
      if (!notification.isRead) {
        state.notifications.unreadCount += 1;
      }
      state.notifications.total += 1;
    },
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.list.find((n) => n.id === notificationId);
      if (notification && !notification.isRead) {
        state.notifications.unreadCount = Math.max(0, state.notifications.unreadCount - 1);
      }
      state.notifications.list = state.notifications.list.filter((n) => n.id !== notificationId);
      state.notifications.total = Math.max(0, state.notifications.total - 1);
    },
    clearNotifications: (state) => {
      state.notifications.list = [];
      state.notifications.total = 0;
      state.notifications.unreadCount = 0;
    },
    setFeedLoading: (state, action) => {
      state.feed.isLoading = action.payload;
    },
    setFriendsActivityLoading: (state, action) => {
      state.friendsActivity.isLoading = action.payload;
    },
    // Follow User
    followUser: (state, action) => {
      const userId = action.payload;
      // Optimistically update UI state
      state.userConnections.following.push({ id: userId });
      state.userConnections.followingCount = (state.userConnections.followingCount || 0) + 1;
    },

    // Unfollow User
    unfollowUser: (state, action) => {
      const userId = action.payload;
      // Optimistically update UI state
      state.userConnections.following = state.userConnections.following.filter(
        (user) => user.id !== userId,
      );
      state.userConnections.followingCount = Math.max(
        0,
        (state.userConnections.followingCount || 0) - 1,
      );
    },

    // Update user connections
    updateUserConnections: (state, action) => {
      const { followers, following } = action.payload;
      state.userConnections.followers = followers;
      state.userConnections.following = following;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Social Feed
      .addCase(loadSocialFeed.pending, (state) => {
        state.feed.isLoading = true;
        state.error = null;
      })
      .addCase(loadSocialFeed.fulfilled, (state, action) => {
        state.feed.isLoading = false;
        state.feed.posts = action.payload.posts;
        state.feed.total = action.payload.total;
        state.feed.hasMore = action.payload.hasMore;
        state.feed.lastFetched = new Date().toISOString();
      })
      .addCase(loadSocialFeed.rejected, (state, action) => {
        state.feed.isLoading = false;
        state.error = action.payload;
      })

      // Create Post
      .addCase(createPost.fulfilled, (state, action) => {
        state.feed.posts.unshift(action.payload);
        state.feed.total += 1;
      })

      // Like/Unlike Post
      .addCase(likePost.fulfilled, (state, action) => {
        const postId = action.payload;
        const post = state.feed.posts.find((p) => p.id === postId);
        if (post) {
          post.isLiked = true;
          post.likeCount += 1;
        }
      })
      .addCase(unlikePost.fulfilled, (state, action) => {
        const postId = action.payload;
        const post = state.feed.posts.find((p) => p.id === postId);
        if (post) {
          post.isLiked = false;
          post.likeCount = Math.max(0, post.likeCount - 1);
        }
      })

      // Comment on Post
      .addCase(commentOnPost.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        const post = state.feed.posts.find((p) => p.id === postId);
        if (post) {
          post.comments.push(comment);
          post.commentCount += 1;
        }
      })

      // Load Friends Activity
      .addCase(loadFriendsActivity.pending, (state) => {
        state.friendsActivity.isLoading = true;
        state.friendsActivity.error = null;
      })
      .addCase(loadFriendsActivity.fulfilled, (state, action) => {
        state.friendsActivity.isLoading = false;
        state.friendsActivity.activities = action.payload;
      })
      .addCase(loadFriendsActivity.rejected, (state, action) => {
        state.friendsActivity.isLoading = false;
        state.friendsActivity.error = action.payload;
      })

      // Load Activity Feed
      .addCase(loadActivityFeed.pending, (state) => {
        state.activityFeed.isLoading = true;
        state.activityFeed.error = null;
      })
      .addCase(loadActivityFeed.fulfilled, (state, action) => {
        state.activityFeed.isLoading = false;
        state.activityFeed.activities = action.payload;
      })
      .addCase(loadActivityFeed.rejected, (state, action) => {
        state.activityFeed.isLoading = false;
        state.activityFeed.error = action.payload;
      })

      // Load Suggested Users
      .addCase(loadSuggestedUsers.pending, (state) => {
        state.suggestedUsers.isLoading = true;
        state.suggestedUsers.error = null;
      })
      .addCase(loadSuggestedUsers.fulfilled, (state, action) => {
        state.suggestedUsers.isLoading = false;
        state.suggestedUsers.users = action.payload;
      })
      .addCase(loadSuggestedUsers.rejected, (state, action) => {
        state.suggestedUsers.isLoading = false;
        state.suggestedUsers.error = action.payload;
      })

      // Load User Connections
      .addCase(loadUserConnections.pending, (state) => {
        state.userConnections.isLoading = true;
        state.userConnections.error = null;
      })
      .addCase(loadUserConnections.fulfilled, (state, action) => {
        state.userConnections.isLoading = false;
        state.userConnections.followers = action.payload.followers;
        state.userConnections.following = action.payload.following;
      })
      .addCase(loadUserConnections.rejected, (state, action) => {
        state.userConnections.isLoading = false;
        state.userConnections.error = action.payload;
      })

      // Share Track/Playlist/Album
      .addCase(shareTrack.fulfilled, (state, action) => {
        state.shares.recentShares.unshift(action.payload);
      })
      .addCase(sharePlaylist.fulfilled, (state, action) => {
        state.shares.recentShares.unshift(action.payload);
      })
      .addCase(shareAlbum.fulfilled, (state, action) => {
        state.shares.recentShares.unshift(action.payload);
      })

      // Load Notifications
      .addCase(loadNotifications.pending, (state) => {
        state.notifications.isLoading = true;
        state.notifications.error = null;
      })
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.notifications.isLoading = false;
        state.notifications.list = action.payload.notifications;
        state.notifications.total = action.payload.total;
        state.notifications.unreadCount = action.payload.unreadCount;
      })
      .addCase(loadNotifications.rejected, (state, action) => {
        state.notifications.isLoading = false;
        state.notifications.error = action.payload;
      })

      // Mark Notification as Read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.list.find((n) => n.id === notificationId);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.notifications.unreadCount = Math.max(0, state.notifications.unreadCount - 1);
        }
      })

      // Follow User
      .addCase(followUser.fulfilled, (state, action) => {
        const userId = action.payload;
        // Update was already handled optimistically in reducer
      })
      .addCase(followUser.rejected, (state, action) => {
        // Revert optimistic update on failure
        state.userConnections.following = state.userConnections.following.filter(
          (user) => user.id !== action.meta.arg,
        );
        state.userConnections.followingCount = Math.max(
          0,
          (state.userConnections.followingCount || 0) - 1,
        );
      })

      // Unfollow User
      .addCase(unfollowUser.fulfilled, (state, action) => {
        const userId = action.payload;
        // Update was already handled optimistically in reducer
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        // Revert optimistic update on failure
        state.userConnections.following.push({ id: action.meta.arg });
        state.userConnections.followingCount = (state.userConnections.followingCount || 0) + 1;
      })

      // Load User Followers
      .addCase(loadUserFollowers.fulfilled, (state, action) => {
        state.userConnections.followers = action.payload;
      })

      // Load User Following
      .addCase(loadUserFollowing.fulfilled, (state, action) => {
        state.userConnections.following = action.payload;
      })

      // Search Users
      .addCase(searchUsers.fulfilled, (state, action) => {
        // Could store search results for caching
      });
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setActiveTab,
  updateSocialSettings,
  addPost,
  updatePost,
  removePost,
  addActivity,
  updateNotification,
  markNotificationRead,
  markAllNotificationsRead,
  addNotification,
  removeNotification,
  clearNotifications,
  setFeedLoading,
  setFriendsActivityLoading,
  setNotificationsLoading,
  updateUserConnections,
} = socialSlice.actions;

export default socialSlice.reducer;
