import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Styles
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

const PlayerControls = ({
  isPlaying,
  repeatMode,
  shuffleMode,
  onPlayPause,
  onNext,
  onPrevious,
  onRepeat,
  onShuffle,
  onQueue,
  onLyrics,
}) => {
  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 1:
        return 'repeat-one';
      case 2:
        return 'repeat';
      default:
        return 'repeat';
    }
  };

  const getRepeatColor = () => {
    return repeatMode > 0 ? colors.primary : colors.text.secondary;
  };

  return (
    <View style={styles.container}>
      {/* Top Row - Shuffle, Previous, Play/Pause, Next, Repeat */}
      <View style={styles.mainControls}>
        <TouchableOpacity
          onPress={onShuffle}
          style={styles.controlButton}
        >
          <Icon
            name="shuffle"
            size={24}
            color={shuffleMode ? colors.primary : colors.text.secondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPrevious}
          style={styles.controlButton}
        >
          <Icon
            name="skip-previous"
            size={32}
            color={colors.text.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPlayPause}
          style={styles.playButton}
        >
          <Icon
            name={isPlaying ? 'pause' : 'play-arrow'}
            size={48}
            color={colors.text.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNext}
          style={styles.controlButton}
        >
          <Icon
            name="skip-next"
            size={32}
            color={colors.text.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onRepeat}
          style={styles.controlButton}
        >
          <Icon
            name={getRepeatIcon()}
            size={24}
            color={getRepeatColor()}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Row - Queue, Lyrics, More options */}
      <View style={styles.secondaryControls}>
        <TouchableOpacity
          onPress={onQueue}
          style={styles.secondaryButton}
        >
          <Icon
            name="queue-music"
            size={20}
            color={colors.text.secondary}
          />
          <Text style={styles.secondaryButtonText}>Queue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onLyrics}
          style={styles.secondaryButton}
        >
          <Icon
            name="lyrics"
            size={20}
            color={colors.text.secondary}
          />
          <Text style={styles.secondaryButtonText}>Lyrics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            // Show more options
          }}
          style={styles.secondaryButton}
        >
          <Icon
            name="more-vert"
            size={20}
            color={colors.text.secondary}
          />
          <Text style={styles.secondaryButtonText}>More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  controlButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '60%',
  },
  secondaryButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  secondaryButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});

export default PlayerControls;
