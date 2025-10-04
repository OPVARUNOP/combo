import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../styles/theme';

const { width } = Dimensions.get('window');

const QueueView = ({ queue, currentTrack, onTrackPress, onRemoveTrack }) => {
  const renderTrackItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.trackItem,
        currentTrack && item.id === currentTrack.id && styles.currentTrackItem,
      ]}
      onPress={() => onTrackPress(item, index)}
    >
      <View style={styles.trackInfo}>
        <Text
          style={[
            styles.trackTitle,
            currentTrack && item.id === currentTrack.id && styles.currentTrackTitle,
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          style={[
            styles.trackArtist,
            currentTrack && item.id === currentTrack.id && styles.currentTrackArtist,
          ]}
          numberOfLines={1}
        >
          {item.artist}
        </Text>
      </View>

      <View style={styles.trackActions}>
        <Text style={styles.trackDuration}>{formatDuration(item.duration)}</Text>
        {onRemoveTrack && (
          <TouchableOpacity style={styles.removeButton} onPress={() => onRemoveTrack(index)}>
            <Ionicons name='close' size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!queue || queue.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name='list' size={64} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>Queue is empty</Text>
        <Text style={styles.emptySubtitle}>Add some tracks to get started</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <Text style={styles.trackCount}>{queue.length} tracks</Text>
      </View>

      <FlatList
        data={queue}
        renderItem={renderTrackItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  currentTrackArtist: {
    color: colors.primary,
  },
  currentTrackItem: {
    backgroundColor: colors.white10,
  },
  currentTrackTitle: {
    color: colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['4xl'],
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
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.white10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    color: colors.text,
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: spacing['4xl'],
  },
  removeButton: {
    padding: spacing.xs,
  },
  trackActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  trackArtist: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  trackCount: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  trackDuration: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    minWidth: 40,
    textAlign: 'right',
  },
  trackInfo: {
    flex: 1,
  },
  trackItem: {
    alignItems: 'center',
    borderBottomColor: colors.white10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  trackTitle: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    marginBottom: 2,
  },
});

export default QueueView;
