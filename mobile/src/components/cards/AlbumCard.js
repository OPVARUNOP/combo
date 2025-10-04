import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Ionicons } from '@expo/vector-icons';

// Theme
import { colors, spacing, typography, radius } from '../../styles/theme';

const { width } = Dimensions.get('window');

const AlbumCard = ({ album, onPress, size = 'medium', showArtist = true, showYear = false }) => {
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

  const handlePress = () => {
    if (onPress && album) {
      onPress(album);
    }
  };

  if (!album) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardSize.width }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {album.artwork ? (
          <FastImage
            source={{ uri: album.artwork }}
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
            <Ionicons name='disc' size={24} color={colors.textSecondary} />
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
          {album.title || 'Unknown Album'}
        </Text>

        {showArtist && (
          <Text style={[styles.artist, size === 'large' && styles.largeArtist]} numberOfLines={1}>
            {album.artist || 'Unknown Artist'}
          </Text>
        )}

        {showYear && album.year && <Text style={styles.year}>{album.year}</Text>}

        {size === 'large' && album.trackCount && (
          <Text style={styles.trackCount}>
            {album.trackCount} {album.trackCount === 1 ? 'track' : 'tracks'}
          </Text>
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
    alignItems: 'flex-start',
    marginRight: spacing.md,
  },
  content: {
    alignItems: 'flex-start',
    width: '100%',
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
  largeTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
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
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'left',
  },
  trackCount: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: 2,
    textAlign: 'left',
  },
  year: {
    color: colors.textDisabled,
    fontSize: typography.fontSize.xs,
    marginTop: 2,
    textAlign: 'left',
  },
});

export default AlbumCard;
