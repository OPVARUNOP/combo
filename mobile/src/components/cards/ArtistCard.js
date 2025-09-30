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

const ArtistCard = ({ artist, onPress, size = 'medium', showFollowers = true, showGenre = false }) => {
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
    if (onPress && artist) {
      onPress(artist);
    }
  };

  const formatFollowers = (count) => {
    if (!count) return '';
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (!artist) return null;

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardSize.width }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {artist.artwork ? (
          <FastImage
            source={{ uri: artist.artwork }}
            style={[styles.image, { width: cardSize.imageSize, height: cardSize.imageSize }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { width: cardSize.imageSize, height: cardSize.imageSize }]}>
            <Ionicons name="person" size={24} color={colors.textSecondary} />
          </View>
        )}

        {size === 'large' && (
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={20} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.name, size === 'large' && styles.largeName]}
          numberOfLines={size === 'large' ? 2 : 1}
        >
          {artist.name || 'Unknown Artist'}
        </Text>

        {showFollowers && artist.monthlyListeners && (
          <Text style={styles.listeners}>
            {formatFollowers(artist.monthlyListeners)} monthly listeners
          </Text>
        )}

        {showGenre && artist.genre && (
          <Text style={styles.genre}>
            {artist.genre}
          </Text>
        )}

        {size === 'large' && artist.trackCount && (
          <Text style={styles.trackCount}>
            {artist.trackCount} {artist.trackCount === 1 ? 'track' : 'tracks'}
          </Text>
        )}

        {size === 'large' && artist.albumCount && (
          <Text style={styles.albumCount}>
            {artist.albumCount} {artist.albumCount === 1 ? 'album' : 'albums'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: spacing.md,
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  image: {
    borderRadius: size === 'large' ? radius.lg : radius.full,
    backgroundColor: colors.gray800,
  },
  imagePlaceholder: {
    borderRadius: size === 'large' ? radius.lg : radius.full,
    backgroundColor: colors.gray800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  name: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
    textAlign: 'center',
  },
  largeName: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'left',
  },
  listeners: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  genre: {
    fontSize: typography.fontSize.xs,
    color: colors.textDisabled,
    textAlign: 'center',
    marginTop: 2,
  },
  trackCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'left',
  },
  albumCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'left',
  },
});

export default ArtistCard;
