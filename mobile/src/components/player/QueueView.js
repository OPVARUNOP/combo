import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../styles/theme';

const { width } = Dimensions.get('window');

const QueueView = ({ queue, currentTrack, onTrackPress, onRemoveTrack }) => {
  const renderTrackItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.trackItem,
        currentTrack && item.id === currentTrack.id && styles.currentTrackItem
      ]}
      onPress={() => onTrackPress(item, index)}
    >
      <View style={styles.trackInfo}>
        <Text
          style={[
            styles.trackTitle,
            currentTrack && item.id === currentTrack.id && styles.currentTrackTitle
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          style={[
            styles.trackArtist,
            currentTrack && item.id === currentTrack.id && styles.currentTrackArtist
          ]}
          numberOfLines={1}
        >
          {item.artist}
        </Text>
      </View>

      <View style={styles.trackActions}>
        <Text style={styles.trackDuration}>
          {formatDuration(item.duration)}
        </Text>
        {onRemoveTrack && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemoveTrack(index)}
          >
            <Ionicons name="close" size={16} color={colors.textSecondary} />
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
        <Ionicons name="list" size={64} color={colors.textSecondary} />
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
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text,
  },
  trackCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: spacing['4xl'],
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
  },
  currentTrackItem: {
    backgroundColor: colors.white10,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginBottom: 2,
  },
  currentTrackTitle: {
    color: colors.primary,
    fontWeight: '600',
  },
  trackArtist: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  currentTrackArtist: {
    color: colors.primary,
  },
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  trackDuration: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },
  removeButton: {
    padding: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['4xl'],
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default QueueView;
