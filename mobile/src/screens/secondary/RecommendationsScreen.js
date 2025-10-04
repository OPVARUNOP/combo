import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Theme
import { colors, spacing } from '../../styles/theme';

const RecommendationsScreen = () => {
  const recommendations = [
    {
      id: '1',
      title: 'Recommended Playlist 1',
      description: 'Based on your listening history',
    },
    {
      id: '2',
      title: 'Discover New Music',
      description: 'Artists similar to your favorites',
    },
    { id: '3', title: 'Mood Mix', description: 'Music for your current mood' },
  ];

  const renderRecommendationItem = ({ item }) => (
    <View style={styles.recommendationItem}>
      <Ionicons name='heart' size={24} color={colors.primary} />
      <View style={styles.recommendationInfo}>
        <Text style={styles.recommendationTitle}>{item.title}</Text>
        <Text style={styles.recommendationDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommendations</Text>
      <FlatList
        data={recommendations}
        renderItem={renderRecommendationItem}
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
  recommendationDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  recommendationInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  recommendationItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  recommendationTitle: {
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

export default RecommendationsScreen;
