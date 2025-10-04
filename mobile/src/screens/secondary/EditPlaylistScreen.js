import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Theme
import { colors, spacing } from '../../styles/theme';

const EditPlaylistScreen = ({ navigation, route }) => {
  const isNew = route.params?.isNew !== false;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isNew ? 'Create Playlist' : 'Edit Playlist'}</Text>
      <View style={styles.placeholder}>
        <Ionicons name='musical-notes' size={64} color={colors.primary} />
        <Text style={styles.placeholderText}>Playlist Editor</Text>
        <Text style={styles.placeholderSubtext}>Playlist editing UI would be implemented here</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.lg,
  },
  placeholder: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  placeholderSubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  placeholderText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
});

export default EditPlaylistScreen;
