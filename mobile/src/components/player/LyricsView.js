import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { colors, spacing, typography } from '../../styles/theme';

const { height } = Dimensions.get('window');

const LyricsView = ({ lyrics, currentTime }) => {
  if (!lyrics || lyrics.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No lyrics available</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {lyrics.map((line, index) => (
        <Text
          key={index}
          style={[
            styles.lyricLine,
            // Highlight current line based on time
            currentTime && line.startTime <= currentTime && line.endTime > currentTime
              ? styles.activeLyricLine
              : null,
          ]}
        >
          {line.text}
        </Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  activeLyricLine: {
    color: colors.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
  },
  lyricLine: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.lg,
    lineHeight: 28,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});

export default LyricsView;
