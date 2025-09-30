import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { Ionicons } from '@expo/vector-icons';

// Theme
import { colors, spacing, typography, radius } from '../../styles/theme';

const { width } = Dimensions.get('window');

const PlaylistCard = ({ playlist, onPress, size = 'medium', showDescription = true, showTrackCount = true }) => {
  const getCardSize = () => {
    switch (size) {
      case 'small':
        return {
          width: 120,
          height: 120,
          imageSize: 120,
        };
      case 'large':
        return {
          width: width * 0.9,
          height: 100,
          imageSize: 80,
        };
      default: // medium
        return {
          width: 140,
          height: 140,
          imageSize: 140,
        };
    }
  };

  const cardSize = getCardSize();

  const handlePress = () => {
    if (onPress && playlist) {
      onPress(playlist);
    }
  };

  if (!playlist) return null;

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardSize.width }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {playlist.artwork ? (
          <FastImage
            source={{ uri: playlist.artwork }}
            style={[styles.image, { width: cardSize.imageSize, height: cardSize.imageSize }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { width: cardSize.imageSize, height: cardSize.imageSize }]}>
            <Ionicons name="musical-notes" size={24} color={colors.textSecondary} />
          </View>
        )}

        {size === 'large' && (
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={24} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.title, size === 'large' && styles.largeTitle]}
          numberOfLines={size === 'large' ? 2 : 1}
        >
          {playlist.title || 'Unknown Playlist'}
        </Text>

        {showDescription && playlist.description && (
          <Text
            style={[styles.description, size === 'large' && styles.largeDescription]}
            numberOfLines={size === 'large' ? 3 : 2}
          >
            {playlist.description}
          </Text>
        )}

        {showTrackCount && playlist.trackCount !== undefined && (
          <Text style={styles.trackCount}>
            {playlist.trackCount} {playlist.trackCount === 1 ? 'track' : 'tracks'}
          </Text>
        )}

        {size === 'large' && playlist.createdBy && (
          <Text style={styles.creator}>
            By {playlist.createdBy}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: spacing.md,
    alignItems: 'flex-start',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  image: {
    borderRadius: radius.md,
    backgroundColor: colors.gray800,
  },
  imagePlaceholder: {
    borderRadius: radius.md,
    backgroundColor: colors.gray800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
    textAlign: 'left',
  },
  largeTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 2,
    textAlign: 'left',
  },
  largeDescription: {
    fontSize: typography.fontSize.base,
    lineHeight: 20,
    marginBottom: 4,
  },
  trackCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textDisabled,
    textAlign: 'left',
  },
  creator: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'left',
  },
});

export default PlaylistCard;
