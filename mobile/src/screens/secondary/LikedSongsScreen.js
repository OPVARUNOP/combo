import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Theme
import { colors, spacing } from '../../styles/theme';

const LikedSongsScreen = () => {
  const likedSongs = [
    { id: '1', title: 'Favorite Song 1', artist: 'Artist 1' },
    { id: '2', title: 'Favorite Song 2', artist: 'Artist 2' },
  ];

  const renderSongItem = ({ item }) => (
    <View style={styles.songItem}>
      <Ionicons name='heart' size={20} color={colors.primary} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liked Songs</Text>
      {likedSongs.length > 0 ? (
        <FlatList
          data={likedSongs}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name='heart-outline' size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No liked songs yet</Text>
          <Text style={styles.emptySubtext}>Like songs to add them here</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  songArtist: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  songInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  songItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  songTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
});

export default LikedSongsScreen;
