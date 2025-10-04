import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Theme
import { colors, spacing } from '../../styles/theme';

const CreatePlaylistScreen = ({ navigation, route }) => {
  const isNew = route.params?.isNew !== false;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name='close' size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{isNew ? 'Create Playlist' : 'Edit Playlist'}</Text>
        <TouchableOpacity>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.placeholder}>
          <Ionicons name='musical-notes' size={64} color={colors.primary} />
          <Text style={styles.placeholderText}>Playlist Creation</Text>
          <Text style={styles.placeholderSubtext}>
            Playlist creation UI would be implemented here
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  doneText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: spacing.xl,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreatePlaylistScreen;
