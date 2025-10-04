import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Image } from 'react-native';
import { colors } from '../constants/theme';

// Mock data for featured content
const featuredContent = [
  { id: '1', title: 'Featured Playlist', description: 'Your weekly mixtape', image: 'https://via.placeholder.com/150' },
  { id: '2', title: 'New Releases', description: 'Fresh tracks for you', image: 'https://via.placeholder.com/150' },
  { id: '3', title: 'Trending Now', description: 'What everyone is listening to', image: 'https://via.placeholder.com/150' },
];

// Mock data for recently played
const recentlyPlayed = [
  { id: '1', title: 'Daily Mix 1', artist: 'Various Artists', image: 'https://via.placeholder.com/80' },
  { id: '2', title: 'Chill Hits', artist: 'Various Artists', image: 'https://via.placeholder.com/80' },
  { id: '3', title: 'Rock Classics', artist: 'Various Artists', image: 'https://via.placeholder.com/80' },
];

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Good morning</Text>
      
      <Text style={styles.sectionTitle}>Featured</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {featuredContent.map((item) => (
          <View key={item.id} style={styles.featuredCard}>
            <Image source={{ uri: item.image }} style={styles.featuredImage} />
            <Text style={styles.featuredTitle}>{item.title}</Text>
            <Text style={styles.featuredDescription}>{item.description}</Text>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Recently played</Text>
      <FlatList
        data={recentlyPlayed}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.recentItem}>
            <Image source={{ uri: item.image }} style={styles.recentImage} />
            <View style={styles.recentInfo}>
              <Text style={styles.recentTitle}>{item.title}</Text>
              <Text style={styles.recentArtist}>{item.artist}</Text>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  horizontalScroll: {
    marginBottom: 24,
  },
  featuredCard: {
    width: 200,
    marginRight: 16,
  },
  featuredImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  featuredTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  featuredDescription: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  recentArtist: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default HomeScreen;
