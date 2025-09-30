import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Components
import TrackCard from '../../components/cards/TrackCard';
import PlaylistCard from '../../components/cards/PlaylistCard';
import AlbumCard from '../../components/cards/AlbumCard';
import ArtistCard from '../../components/cards/ArtistCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Mock API functions
const searchAPI = {
  search: async (query) => {
    // Mock search results
    return {
      data: {
        tracks: [
          { id: '1', title: `Search Result 1 for "${query}"`, artist: 'Artist 1', album: 'Album 1', duration: 180 },
          { id: '2', title: `Search Result 2 for "${query}"`, artist: 'Artist 2', album: 'Album 2', duration: 240 },
        ],
        albums: [
          { id: '1', title: `Album Result 1 for "${query}"`, artist: 'Artist 1', trackCount: 12 },
        ],
        artists: [
          { id: '1', name: `Artist Result 1 for "${query}"`, trackCount: 25 },
        ],
        playlists: [
          { id: '1', title: `Playlist Result 1 for "${query}"`, description: '25 tracks', trackCount: 25 },
        ]
      }
    };
  }
};

const trackAPI = { getByIds: async (ids) => ({ data: { tracks: [] } }) };
const albumAPI = { getByIds: async (ids) => ({ data: { albums: [] } }) };
const artistAPI = { getByIds: async (ids) => ({ data: { artists: [] } }) };
const playlistAPI = { getByIds: async (ids) => ({ data: { playlists: [] } }) };

// Theme
import { colors, spacing, typography, radius } from '../styles/theme';

const { width, height } = Dimensions.get('window');

const SearchScreen = () => {
  const navigation = useNavigation();
  const searchInputRef = useRef(null);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    tracks: [],
    albums: [],
    artists: [],
    playlists: [],
  });
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Animations
  const searchBarHeight = useRef(new Animated.Value(60)).current;
  const resultsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadInitialData();
    // Focus search input when screen loads
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      performSearch();
    } else {
      clearSearch();
    }
  }, [searchQuery]);

  const loadInitialData = async () => {
    try {
      const [trendingResponse, recentResponse] = await Promise.all([
        searchAPI.getTrendingSearches(),
        // Load recent searches from local storage or API
        Promise.resolve({ data: { searches: [] } }),
      ]);

      setTrendingSearches(trendingResponse.data.searches || []);
      setRecentSearches(recentResponse.data.searches || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const performSearch = async () => {
    if (searchQuery.trim().length < 2) return;

    setIsSearching(true);
    try {
      const response = await searchAPI.search(searchQuery, {
        limit: 20,
        includeTracks: true,
        includeAlbums: true,
        includeArtists: true,
        includePlaylists: true,
      });

      setSearchResults({
        tracks: response.data.tracks || [],
        albums: response.data.albums || [],
        artists: response.data.artists || [],
        playlists: response.data.playlists || [],
      });

      // Save to recent searches
      saveRecentSearch(searchQuery);
    } catch (error) {
      console.error('Error performing search:', error);
      setSearchResults({
        tracks: [],
        albums: [],
        artists: [],
        playlists: [],
      });
    } finally {
      setIsSearching(false);
    }
  };

  const saveRecentSearch = async (query) => {
    try {
      const updatedSearches = [
        query,
        ...recentSearches.filter(item => item !== query)
      ].slice(0, 10);

      setRecentSearches(updatedSearches);
      // Save to local storage or API
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const clearSearch = () => {
    setSearchResults({
      tracks: [],
      albums: [],
      artists: [],
      playlists: [],
    });
    setIsSearching(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    // Clear from local storage or API
  };

  const handleTrackPress = (track) => {
    navigation.navigate('Player', { track });
  };

  const handleAlbumPress = (album) => {
    navigation.navigate('Album', { album });
  };

  const handleArtistPress = (artist) => {
    navigation.navigate('Artist', { artist });
  };

  const handlePlaylistPress = (playlist) => {
    navigation.navigate('Playlist', { playlist });
  };

  const handleRecentSearchPress = (query) => {
    setSearchQuery(query);
  };

  const handleTrendingSearchPress = (query) => {
    setSearchQuery(query);
  };

  const renderSearchResult = ({ item }) => {
    switch (item.type) {
      case 'track':
        return (
          <TrackCard
            track={item.data}
            onPress={() => handleTrackPress(item.data)}
          />
        );
      case 'album':
        return (
          <AlbumCard
            album={item.data}
            onPress={() => handleAlbumPress(item.data)}
          />
        );
      case 'artist':
        return (
          <ArtistCard
            artist={item.data}
            onPress={() => handleArtistPress(item.data)}
          />
        );
      case 'playlist':
        return (
          <PlaylistCard
            playlist={item.data}
            onPress={() => handlePlaylistPress(item.data)}
          />
        );
      default:
        return null;
    }
  };

  const renderRecentSearch = ({ item }) => (
    <TouchableOpacity
      style={styles.recentSearchItem}
      onPress={() => handleRecentSearchPress(item)}
    >
      <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
      <Text style={styles.recentSearchText} numberOfLines={1}>
        {item}
      </Text>
      <TouchableOpacity
        onPress={() => {
          const filtered = recentSearches.filter(search => search !== item);
          setRecentSearches(filtered);
        }}
      >
        <Ionicons name="close" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderTrendingSearch = ({ item }) => (
    <TouchableOpacity
      style={styles.trendingSearchItem}
      onPress={() => handleTrendingSearchPress(item.query)}
    >
      <Text style={styles.trendingSearchText} numberOfLines={1}>
        {item.query}
      </Text>
      {item.count && (
        <Text style={styles.trendingSearchCount}>
          {item.count}
        </Text>
      )}
    </TouchableOpacity>
  );

  const getAllResults = () => {
    const results = [];
    searchResults.tracks.forEach(track => results.push({ type: 'track', data: track }));
    searchResults.albums.forEach(album => results.push({ type: 'album', data: album }));
    searchResults.artists.forEach(artist => results.push({ type: 'artist', data: artist }));
    searchResults.playlists.forEach(playlist => results.push({ type: 'playlist', data: playlist }));
    return results;
  };

  const getFilteredResults = () => {
    switch (activeTab) {
      case 'tracks':
        return searchResults.tracks.map(track => ({ type: 'track', data: track }));
      case 'albums':
        return searchResults.albums.map(album => ({ type: 'album', data: album }));
      case 'artists':
        return searchResults.artists.map(artist => ({ type: 'artist', data: artist }));
      case 'playlists':
        return searchResults.playlists.map(playlist => ({ type: 'playlist', data: playlist }));
      default:
        return getAllResults();
    }
  };

  const SearchTabs = () => (
    <View style={styles.tabsContainer}>
      {[
        { key: 'all', label: 'All', count: getAllResults().length },
        { key: 'tracks', label: 'Tracks', count: searchResults.tracks.length },
        { key: 'albums', label: 'Albums', count: searchResults.albums.length },
        { key: 'artists', label: 'Artists', count: searchResults.artists.length },
        { key: 'playlists', label: 'Playlists', count: searchResults.playlists.length },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            activeTab === tab.key && styles.activeTab
          ]}
          onPress={() => setActiveTab(tab.key)}
        >
          <Text style={[
            styles.tabText,
            activeTab === tab.key && styles.activeTabText
          ]}>
            {tab.label}
          </Text>
          {tab.count > 0 && (
            <View style={[
              styles.tabCount,
              activeTab === tab.key && styles.activeTabCount
            ]}>
              <Text style={[
                styles.tabCountText,
                activeTab === tab.key && styles.activeTabCountText
              ]}>
                {tab.count}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyStateTitle}>Search for music</Text>
      <Text style={styles.emptyStateSubtitle}>
        Find tracks, albums, artists, and playlists
      </Text>
    </View>
  );

  const LoadingState = () => (
    <View style={styles.loadingState}>
      <LoadingSpinner size="large" />
      <Text style={styles.loadingText}>Searching...</Text>
    </View>
  );

  const NoResultsState = () => (
    <View style={styles.noResultsState}>
      <Ionicons name="search-off" size={64} color={colors.textSecondary} />
      <Text style={styles.noResultsTitle}>No results found</Text>
      <Text style={styles.noResultsSubtitle}>
        Try searching for something else
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradientBg}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search for music, artists, albums..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Tabs */}
        {searchQuery.length > 0 && (
          <SearchTabs />
        )}

        {/* Content */}
        {searchQuery.length === 0 ? (
          // Initial state - show recent and trending searches
          <ScrollView style={styles.initialContent} showsVerticalScrollIndicator={false}>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearRecentSearches}>
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={recentSearches}
                  renderItem={renderRecentSearch}
                  keyExtractor={(item, index) => `recent-${index}`}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* Trending Searches */}
            {trendingSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Trending</Text>
                </View>
                <FlatList
                  data={trendingSearches}
                  renderItem={renderTrendingSearch}
                  keyExtractor={(item, index) => `trending-${index}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.trendingList}
                />
              </View>
            )}

            {/* Empty State */}
            {recentSearches.length === 0 && trendingSearches.length === 0 && (
              <EmptyState />
            )}
          </ScrollView>
        ) : (
          // Search results
          <View style={styles.resultsContainer}>
            {isSearching ? (
              <LoadingState />
            ) : getFilteredResults().length > 0 ? (
              <FlatList
                data={getFilteredResults()}
                renderItem={renderSearchResult}
                keyExtractor={(item, index) => `${item.type}-${item.data.id}-${index}`}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.resultsList}
                columnWrapperStyle={styles.resultsRow}
              />
            ) : (
              <NoResultsState />
            )}
          </View>
        )}
      </LinearGradient>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing['3xl'] : spacing.xl,
    paddingBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white10,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.white10,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  activeTabText: {
    color: colors.white,
  },
  tabCount: {
    backgroundColor: colors.white20,
    borderRadius: radius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  activeTabCount: {
    backgroundColor: colors.white20,
  },
  tabCountText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabCountText: {
    color: colors.white,
  },
  initialContent: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  resultsContainer: {
    flex: 1,
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  clearText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  recentSearchText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  trendingList: {
    paddingHorizontal: spacing.lg,
  },
  trendingSearchItem: {
    backgroundColor: colors.white10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    marginRight: spacing.md,
    minWidth: 120,
    alignItems: 'center',
  },
  trendingSearchText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  trendingSearchCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['4xl'],
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
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  noResultsState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['4xl'],
  },
  noResultsTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  noResultsSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  resultsList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  resultsRow: {
    justifyContent: 'space-between',
  },
});

export default SearchScreen;
