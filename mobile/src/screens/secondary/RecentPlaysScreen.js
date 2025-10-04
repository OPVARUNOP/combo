import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Theme
import { colors, spacing } from '../../styles/theme';

const RecentPlaysScreen = () => {
  const recentTracks = [
    {
      id: '1',
      title: 'Recent Song 1',
      artist: 'Artist 1',
      playedAt: '2 hours ago',
    },
    {
      id: '2',
      title: 'Recent Song 2',
      artist: 'Artist 2',
      playedAt: '5 hours ago',
    },
  ];

  const renderTrackItem = ({ item }) => (
    <View style={styles.trackItem}>
      <Ionicons name='play-circle' size={20} color={colors.primary} />
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{item.title}</Text>
        <Text style={styles.trackArtist}>{item.artist}</Text>
        <Text style={styles.playedAt}>{item.playedAt}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recently Played</Text>
      <FlatList
        data={recentTracks}
        renderItem={renderTrackItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.lg,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  playedAt: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  trackArtist: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  trackInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  trackItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  trackTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RecentPlaysScreen;
