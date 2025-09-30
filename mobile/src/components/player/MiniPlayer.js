import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Animated as RNAnimated,
  Easing,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  useAnimatedProps,
} from 'react-native-reanimated';
import TrackPlayer, { 
  usePlaybackState,
  State as TrackPlayerState,
  useTrackPlayerProgress,
  useTrackPlayerEvents,
  Event,
} from 'react-native-track-player';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Components
import { BlurView } from 'expo-blur';
import FastImage from 'react-native-fast-image';

// Redux
import { setMiniPlayer, setPlaybackState } from '../../redux/slices/playerSlice';

// Theme
import { colors, spacing, typography, shadows } from '../../styles/theme';

const { width, height } = Dimensions.get('window');
const MINI_PLAYER_HEIGHT = 70;
const THRESHOLD = 100;

const MiniPlayer = ({ onPress }) => {
  const dispatch = useDispatch();
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const progressAnim = React.useRef(new RNAnimated.Value(0)).current;
  
  // Get current track and player state
  const { currentTrack, queue, currentIndex } = useSelector(
    (state) => state.player
  );
  
  // Get playback state and progress
  const playbackState = usePlaybackState();
  const { position, duration, buffered } = useTrackPlayerProgress();
  
  // Update progress bar
  useEffect(() => {
    if (duration > 0) {
      const progressPercent = (position / duration) * 100 || 0;
      RNAnimated.timing(progressAnim, {
        toValue: progressPercent,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [position, duration]);
  
  // Handle track changes
  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
    if (event.nextTrack !== null) {
      // Track changed, update UI
      const track = await TrackPlayer.getTrack(event.nextTrack);
      if (track) {
        // Handle new track
      }
    }
  });
  
  // Handle player state changes
  useEffect(() => {
    dispatch(setPlaybackState({
      isPlaying: playbackState === TrackPlayerState.Playing,
      isPaused: playbackState === TrackPlayerState.Paused,
      isStopped: playbackState === TrackPlayerState.Stopped,
      isBuffering: playbackState === TrackPlayerState.Buffering,
    }));
  }, [playbackState]);
  
  // Gesture handler for swipe up/down
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      // Only allow swiping up
      if (event.translationY < 0) {
        translateY.value = ctx.startY + event.translationY;
        
        // Scale down slightly when swiping up
        const scaleValue = 1 - Math.min(Math.abs(event.translationY) / 500, 0.1);
        scale.value = withTiming(scaleValue, { duration: 100 });
      }
    },
    onEnd: (event, ctx) => {
      // Snap back to original position or open full player
      if (event.translationY < -THRESHOLD || event.velocityY < -1000) {
        // Open full player
        translateY.value = withSpring(-height * 0.7, {
          damping: 15,
          stiffness: 100,
        }, () => {
          runOnJS(handleOpenPlayer)();
        });
      } else {
        // Return to mini player
        translateY.value = withSpring(0, { damping: 15 });
        scale.value = withTiming(1, { duration: 300 });
      }
    },
  });
  
  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));
  
  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressAnim}%`,
  }));
  
  // Player controls
  const handlePlayPause = async () => {
    if (playbackState === TrackPlayerState.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };
  
  const handleNext = async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch (error) {
      console.error('Error skipping to next track:', error);
    }
  };
  
  const handlePrevious = async () => {
    try {
      // If we're more than 3 seconds into the song, restart it
      if (position > 3) {
        await TrackPlayer.seekTo(0);
      } else {
        await TrackPlayer.skipToPrevious();
      }
    } catch (error) {
      console.error('Error skipping to previous track:', error);
    }
  };
  
  const handleOpenPlayer = () => {
    if (onPress) {
      onPress();
    }
  };

  if (!currentTrack) return null;
  
  // Get formatted time
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, containerStyle]}>
        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, progressBarStyle]} />
        </View>
        
        {/* Mini player content */}
        <TouchableWithoutFeedback onPress={handleOpenPlayer}>
          <View style={styles.content}>
            {/* Album art with fallback */}
            <View style={styles.artworkContainer}>
              {currentTrack.artwork ? (
                <FastImage 
                  source={{ uri: currentTrack.artwork }}
                  style={styles.artwork}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.artwork, styles.artworkPlaceholder]}>
                  <Ionicons name="musical-notes" size={24} color={colors.textSecondary} />
                </View>
              )}
            </View>
            
            {/* Track info */}
            <View style={styles.trackInfo}>
              <Text style={styles.title} numberOfLines={1}>
                {currentTrack.title || 'Unknown Track'}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                {currentTrack.artist || 'Unknown Artist'}
              </Text>
            </View>
            
            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handlePlayPause}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={
                    playbackState === TrackPlayerState.Playing 
                      ? 'pause' 
                      : 'play'
                  }
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handleNext}
                disabled={currentIndex >= queue.length - 1}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons 
                  name="play-skip-forward" 
                  size={22} 
                  color={
                    currentIndex < queue.length - 1 
                      ? colors.text 
                      : colors.textDisabled
                  } 
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: MINI_PLAYER_HEIGHT,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    zIndex: 100,
    ...shadows.lg,
  },
  progressBarContainer: {
    height: 2,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  artworkContainer: {
    marginRight: spacing[3],
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  artworkPlaceholder: {
    backgroundColor: colors.gray800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
    marginRight: spacing[3],
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  artist: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    marginLeft: spacing[4],
    padding: spacing[1],
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    marginTop: 2,
  },
  timeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
});

export default MiniPlayer;
