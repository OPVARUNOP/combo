import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Ionicons } from '@expo/vector-icons';

// Theme
import { colors, spacing, typography, radius } from '../../styles/theme';

const { width } = Dimensions.get('window');

const TrackCard = ({ track, onPress, size = 'medium', showArtist = true, showDuration = true }) => {
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
          height: 80,
          imageSize: 60,
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

  const formatDuration = (durationMs) => {
    if (!durationMs) {
      return '';
    }
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePress = () => {
    if (onPress && track) {
      onPress(track);
    }
  };

  if (!track) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardSize.width }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {track.artwork ? (
          <FastImage
            source={{ uri: track.artwork }}
            style={[styles.image, { width: cardSize.imageSize, height: cardSize.imageSize }]}
            resizeMode='cover'
          />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              { width: cardSize.imageSize, height: cardSize.imageSize },
            ]}
          >
            <Ionicons name='musical-notes' size={24} color={colors.textSecondary} />
          </View>
        )}

        {size === 'large' && (
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name='play' size={20} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.title, size === 'large' && styles.largeTitle]}
          numberOfLines={size === 'large' ? 2 : 1}
        >
          {track.title || 'Unknown Track'}
        </Text>

        {showArtist && (
          <Text style={[styles.artist, size === 'large' && styles.largeArtist]} numberOfLines={1}>
            {track.artist || 'Unknown Artist'}
          </Text>
        )}

        {showDuration && track.duration && size !== 'large' && (
          <Text style={styles.duration}>{formatDuration(track.duration)}</Text>
        )}

        {size === 'large' && track.duration && (
          <Text style={styles.largeDuration}>{formatDuration(track.duration)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  artist: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'left',
  },
  container: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    alignItems: 'flex-start',
    width: '100%',
  },
  duration: {
    color: colors.textDisabled,
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  image: {
    backgroundColor: colors.gray800,
    borderRadius: radius.md,
  },
  imageContainer: {
    marginBottom: spacing.sm,
    position: 'relative',
  },
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.gray800,
    borderRadius: radius.md,
    justifyContent: 'center',
  },
  largeArtist: {
    fontSize: typography.fontSize.base,
    marginBottom: 4,
  },
  largeDuration: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  largeTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: 4,
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    bottom: 8,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    width: 32,
  },
  title: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    marginBottom: 2,
    textAlign: 'left',
  },
});

export default TrackCard;
