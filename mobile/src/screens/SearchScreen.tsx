import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, ListRenderItem } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@constants/theme';

interface SearchResultItem {
  id: string;
  title: string;
  type: string;
  image: string;
}

// Mock data for search results
const mockSearchResults = [
  { id: '1', title: 'Top Hits', type: 'playlist', image: 'https://via.placeholder.com/150' },
  { id: '2', title: 'Discover Weekly', type: 'playlist', image: 'https://via.placeholder.com/150' },
  { id: '3', title: 'Chill Hits', type: 'playlist', image: 'https://via.placeholder.com/150' },
  { id: '4', title: 'Rock Classics', type: 'playlist', image: 'https://via.placeholder.com/150' },
  { id: '5', title: 'Pop Rising', type: 'playlist', image: 'https://via.placeholder.com/150' },
];

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const renderSearchResult: ListRenderItem<SearchResultItem> = ({ item }) => (
    <TouchableOpacity style={styles.resultItem}>
      <Image source={{ uri: item.image }} style={styles.resultImage} />
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.resultType}>{item.type}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={24} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for songs, artists, or playlists"
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearching(true)}
          onBlur={() => !searchQuery && setIsSearching(false)}
        />
      </View>

      {isSearching ? (
        <FlatList
          data={searchQuery ? mockSearchResults.filter(item => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
          ) : mockSearchResults}
          keyExtractor={item => item.id}
          renderItem={renderSearchResult}
          contentContainerStyle={styles.resultsList}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.sectionTitle}>Browse all</Text>
          <View style={styles.categoriesContainer}>
            {['Podcasts', 'Live Events', 'Made For You', 'New Releases', 'Hip-Hop', 'Pop', 'Rock', 'R&B', 'Jazz', 'Classical'].map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: colors.text,
    fontSize: 16,
  },
  resultsList: {
    padding: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultType: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  suggestionsContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    aspectRatio: 1.5,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  categoryText: {
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SearchScreen;
