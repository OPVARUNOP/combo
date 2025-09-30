import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import TrackPlayer, { useProgress } from 'react-native-track-player';

// Components
import AlbumArt from '../../components/player/AlbumArt';
import ProgressBar from '../../components/player/ProgressBar';
import PlayerControls from '../../components/player/PlayerControls';
import LyricsView from '../../components/player/LyricsView';
import QueueView from '../../components/player/QueueView';
import MiniPlayer from '../../components/player/MiniPlayer';

// Redux
import {
  setMiniPlayer,
  toggleLyrics,
  setLyrics,
  nextTrack,
  previousTrack,
  setRepeatMode,
  toggleShuffle,
} from '../../redux/slices/playerSlice';

// Styles
import { colors, spacing, typography } from '../../styles/theme';

const { height, width } = Dimensions;

const PlayerScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const translateY = useSharedValue(0);
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  const {
    currentTrack,
    playbackState,
    repeatMode,
    shuffleMode,
    isMiniPlayer,
  } = useSelector((state) => state.player);

  const progress = useProgress();

  useEffect(() => {
    if (route.params?.track) {
      // Handle initial track
    }

    // Load lyrics for current track
    loadLyrics();

    return () => {
      // Cleanup
    };
  }, [currentTrack]);

  const loadLyrics = async () => {
    if (currentTrack) {
      try {
        // Fetch lyrics from API
        const lyrics = await fetchLyrics(currentTrack.id);
        dispatch(setLyrics(lyrics));
      } catch (error) {
        console.error('Failed to load lyrics:', error);
      }
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateY.value = ctx.startY + event.translationY;

      if (translateY.value > 0) {
        translateY.value = Math.min(translateY.value, height * 0.8);
      }
    },
    onEnd: (event) => {
      if (translateY.value > height * 0.3) {
        // Dismiss player
        translateY.value = withTiming(height, {}, () => {
          runOnJS(() => {
            dispatch(setMiniPlayer(true));
            navigation.goBack();
          });
        });
      } else {
        // Snap back to original position
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [0, height * 0.3],
      [1, 0.3],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY: translateY.value }],
      opacity,
    };
  });

  const backgroundStyle = useAnimatedStyle(() => {
    const backgroundOpacity = interpolate(
      translateY.value,
      [0, height * 0.3],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity: backgroundOpacity,
    };
  });

  const handlePlayPause = async () => {
    if (playbackState.isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const handleNext = () => {
    dispatch(nextTrack());
  };

  const handlePrevious = () => {
    dispatch(previousTrack());
  };

  const handleRepeat = () => {
    const nextMode = (repeatMode + 1) % 3;
    dispatch(setRepeatMode(nextMode));
    TrackPlayer.setRepeatMode(nextMode);
  };

  const handleShuffle = () => {
    dispatch(toggleShuffle());
  };

  const handleSeekTo = async (position) => {
    await TrackPlayer.seekTo(position);
  };

  const toggleQueue = () => {
    setShowQueue(!showQueue);
  };

  const toggleLyricsView = () => {
    setShowLyrics(!showLyrics);
    dispatch(toggleLyrics());
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background */}
      <Animated.View style={[styles.background, backgroundStyle]}>
        <AlbumArt
          source={currentTrack.thumbnail}
          size={width}
          blur
        />
      </Animated.View>

      {/* Main Content */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>↓</Text>
            </TouchableOpacity>

            <Text style={styles.trackTitle} numberOfLines={1}>
              {currentTrack.title}
            </Text>

            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => {
                // Show more options
              }}
            >
              <Text style={styles.moreButtonText}>⋯</Text>
            </TouchableOpacity>
          </View>

          {/* Album Art */}
          <View style={styles.albumArtContainer}>
            <AlbumArt
              source={currentTrack.thumbnail}
              size={width * 0.7}
            />
          </View>

          {/* Track Info */}
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle} numberOfLines={2}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={progress.position}
              duration={progress.duration}
              buffered={progress.buffered}
              onSeek={handleSeekTo}
            />
          </View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            <PlayerControls
              isPlaying={playbackState.isPlaying}
              repeatMode={repeatMode}
              shuffleMode={shuffleMode}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onRepeat={handleRepeat}
              onShuffle={handleShuffle}
              onQueue={toggleQueue}
              onLyrics={toggleLyricsView}
            />
          </View>

          {/* Queue/Lyrics Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !showQueue && styles.activeToggle,
              ]}
              onPress={() => setShowQueue(false)}
            >
              <Text style={[
                styles.toggleText,
                !showQueue && styles.activeToggleText,
              ]}>
                Up Next
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                showQueue && styles.activeToggle,
              ]}
              onPress={() => setShowQueue(true)}
            >
              <Text style={[
                styles.toggleText,
                showQueue && styles.activeToggleText,
              ]}>
                Lyrics
              </Text>
            </TouchableOpacity>
          </View>

          {/* Queue or Lyrics */}
          {showQueue ? (
            <QueueView />
          ) : (
            <LyricsView />
          )}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  trackTitle: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: spacing.md,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButtonText: {
    color: colors.text.primary,
    fontSize: 18,
  },
  albumArtContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  trackInfo: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  artistName: {
    ...typography.body1,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  progressContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  controlsContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  toggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeToggle: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  activeToggleText: {
    color: colors.text.primary,
  },
});

export default PlayerScreen;
