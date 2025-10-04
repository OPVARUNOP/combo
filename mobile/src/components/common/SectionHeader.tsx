import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../styles/theme';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  showSeeAll?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onSeeAll,
  showSeeAll = true,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {showSeeAll && onSeeAll && (
        <TouchableOpacity 
          style={styles.seeAllButton} 
          onPress={onSeeAll}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  } as ViewStyle,
  seeAllButton: {
    alignItems: 'center',
    flexDirection: 'row',
  } as ViewStyle,
  seeAllText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginRight: 4,
  } as TextStyle,
  title: {
    color: colors.text,
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    flexShrink: 1,
  } as TextStyle,
});

export default SectionHeader;
