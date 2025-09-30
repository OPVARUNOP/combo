import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
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
              : null
          ]}
        >
          {line.text}
        </Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  lyricLine: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 28,
  },
  activeLyricLine: {
    color: colors.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default LyricsView;
