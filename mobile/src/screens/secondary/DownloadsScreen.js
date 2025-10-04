import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Theme
import { colors, spacing } from '../../styles/theme';

const DownloadsScreen = () => {
  const downloads = [
    { id: '1', title: 'Offline Playlist 1', tracks: 25, size: '2.1 GB' },
    { id: '2', title: 'Downloaded Album', tracks: 12, size: '890 MB' },
  ];

  const renderDownloadItem = ({ item }) => (
    <View style={styles.downloadItem}>
      <Ionicons name='download' size={24} color={colors.primary} />
      <View style={styles.downloadInfo}>
        <Text style={styles.downloadTitle}>{item.title}</Text>
        <Text style={styles.downloadDetails}>
          {item.tracks} tracks • {item.size}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Downloads</Text>
      {downloads.length > 0 ? (
        <FlatList
          data={downloads}
          renderItem={renderDownloadItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name='download-outline' size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No downloads yet</Text>
          <Text style={styles.emptySubtext}>Download music to listen offline</Text>
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
  downloadDetails: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  downloadInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  downloadItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  downloadTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
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
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
});

export default DownloadsScreen;
