import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated as RNAnimated,
  Easing,
  ScrollView,
  StatusBar,
  Platform,
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
} from 'react-native-reanimated';
import TrackPlayer, {
  usePlaybackState,
  State as TrackPlayerState,
  useTrackPlayerProgress,
  useTrackPlayerEvents,
  Event,
} from 'react-native-track-player';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

// Components
import FastImage from 'react-native-fast-image';
import { BlurView } from 'expo-blur';

// Redux
import { setMiniPlayer } from '../../redux/slices/playerSlice';

// Theme
import { colors, spacing, typography, shadows } from '../../styles/theme';

const { width, height } = Dimensions.get('window');
const ARTWORK_SIZE = width * 0.8;
const HEADER_HEIGHT = 60;
const TAB_BAR_HEIGHT = 60;

const FullPlayer = ({ onClose }) => {
  const dispatch = useDispatch();
  const scrollY = useSharedValue(0);
  const translateY = useSharedValue(height);
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const progressAnim = useRef(new RNAnimated.Value(0)).current;
  const scrollViewRef = useRef();
  
  // Get player state
  const { currentTrack, queue, currentIndex } = useSelector(
    (state) => state.player
  );
  
  // Get playback state and progress
  const playbackState = usePlaybackState();
  const { position, duration, buffered } = useTrackPlayerProgress();
  
  // Animation for progress bar
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
  
  // Animate in when mounted
  useEffect(() => {
    translateY.value = withSpring(0, {
      damping: 20,
      stiffness: 90,
    });
    scale.value = withTiming(1, { duration: 300 });
    opacity.value = withTiming(1, { duration: 200 });
    
    return () => {
      // Cleanup
      translateY.value = height;
      scale.value = 0.9;
      opacity.value = 0;
    };
  }, []);
  
  // Handle swipe down to minimize
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      // Only allow swiping down
      if (event.translationY > 0) {
        translateY.value = ctx.startY + event.translationY;
        
        // Scale down slightly when swiping down
        const scaleValue = 1 - Math.min(event.translationY / 1000, 0.1);
        scale.value = withTiming(scaleValue, { duration: 100 });
      }
    },
    onEnd: (event, ctx) => {
      // If swiped down enough or fast enough, close the player
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withSpring(height, {
          damping: 20,
          stiffness: 90,
        }, () => {
          runOnJS(handleClose)();
        });
      } else {
        // Return to full screen
        translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
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
  
  const handleSeek = async (value) => {
    try {
      await TrackPlayer.seekTo(value);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };
  
  const handleClose = () => {
    dispatch(setMiniPlayer(true));
    if (onClose) onClose();
  };
  
  const handleScroll = (event) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  };
  
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Don't render if no track is playing
  if (!currentTrack) return null;
  
  // Calculate progress for slider
  const progress = duration > 0 ? position / duration : 0;
  
  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, containerStyle]}>
        <StatusBar barStyle="light-content" />
        
        {/* Background artwork with blur */}
        {currentTrack.artwork && (
          <View style={styles.backgroundImageContainer}>
            <FastImage
              source={{ uri: currentTrack.artwork }}
              style={styles.backgroundImage}
              blurRadius={10}
              resizeMode="cover"
            />
            <View style={styles.overlay} />
          </View>
        )}
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="chevron-down" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {currentTrack.album || 'Now Playing'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.menuButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Main content */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          bounces={false}
          overScrollMode="never"
        >
          {/* Artwork */}
          <View style={styles.artworkContainer}>
            {currentTrack.artwork ? (
              <FastImage
                source={{ uri: currentTrack.artwork }}
                style={styles.artwork}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.artwork, styles.artworkPlaceholder]}>
                <Ionicons name="musical-notes" size={64} color={colors.textSecondary} />
              </View>
            )}
          </View>
          
          {/* Track info */}
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle} numberOfLines={1}>
              {currentTrack.title || 'Unknown Track'}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {currentTrack.artist || 'Unknown Artist'}
            </Text>
          </View>
          
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>
                {formatTime(position)}
              </Text>
              <Text style={styles.timeText}>
                -{formatTime(duration - position)}
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration || 1}
              value={position}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
              thumbTintColor={colors.primary}
              onSlidingComplete={handleSeek}
              tapToSeek={true}
            />
          </View>
          
          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="shuffle" size={24} color={colors.text} />
            </TouchableOpacity>
            
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handlePrevious}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                disabled={currentIndex <= 0}
              >
                <Ionicons
                  name="play-skip-back"
                  size={28}
                  color={currentIndex > 0 ? colors.text : colors.textDisabled}
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPause}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={
                    playbackState === TrackPlayerState.Playing
                      ? 'pause'
                      : 'play'
                  }
                  size={36}
                  color={colors.text}
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleNext}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                disabled={currentIndex >= queue.length - 1}
              >
                <Ionicons
                  name="play-skip-forward"
                  size={28}
                  color={
                    currentIndex < queue.length - 1
                      ? colors.text
                      : colors.textDisabled
                  }
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.controlButton}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Ionicons name="repeat" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {/* Additional controls */}
            <View style={styles.additionalControls}>
              <TouchableOpacity style={styles.additionalButton}>
                <Ionicons name="heart-outline" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.additionalButton}>
                <Ionicons name="share-social-outline" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.additionalButton}>
                <Ionicons name="add-circle-outline" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.additionalButton}>
                <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {/* Queue */}
            <View style={styles.queueContainer}>
              <View style={styles.queueHeader}>
                <Text style={styles.queueTitle}>Up Next</Text>
                <TouchableOpacity>
                  <Text style={styles.queueAction}>Queue</Text>
                </TouchableOpacity>
              </View>
              
              {queue.slice(currentIndex + 1, currentIndex + 4).map((track, index) => (
                <TouchableOpacity
                  key={`${track.id}-${index}`}
                  style={styles.queueItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.queueArtworkContainer}>
                    {track.artwork ? (
                      <FastImage
                        source={{ uri: track.artwork }}
                        style={styles.queueArtwork}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.queueArtwork, styles.queueArtworkPlaceholder]}>
                        <Ionicons name="musical-notes" size={20} color={colors.textSecondary} />
                      </View>
                    )}
                  </View>
                  <View style={styles.queueInfo}>
                    <Text style={styles.queueTrackTitle} numberOfLines={1}>
                      {track.title}
                    </Text>
                    <Text style={styles.queueArtistName} numberOfLines={1}>
                      {track.artist}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.queueMoreButton}>
                    <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          {/* Bottom safe area */}
          <View style={styles.bottomSafeArea} />
        </Animated.View>
      </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backgroundImageContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    height: HEADER_HEIGHT,
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight + 10,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  artworkContainer: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    alignSelf: 'center',
    marginTop: spacing[6],
    marginBottom: spacing[6],
    ...shadows.lg,
  },
  artwork: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  artworkPlaceholder: {
    backgroundColor: colors.gray800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: spacing[6],
    paddingHorizontal: spacing[6],
  },
  trackTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing[1],
  },
  artistName: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: spacing[6],
    marginBottom: spacing[6],
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  timeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[8],
    marginBottom: spacing[6],
  },
  controlButton: {
    padding: spacing[2],
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing[6],
    marginBottom: spacing[6],
  },
  additionalButton: {
    padding: spacing[2],
  },
  queueContainer: {
    marginTop: spacing[4],
    paddingHorizontal: spacing[4],
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  queueTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  queueAction: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    borderRadius: 6,
  },
  queueArtworkContainer: {
    marginRight: spacing[3],
  },
  queueArtwork: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  queueArtworkPlaceholder: {
    backgroundColor: colors.gray800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  queueInfo: {
    flex: 1,
    marginRight: spacing[2],
  },
  queueTrackTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginBottom: 2,
  },
  queueArtistName: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  queueMoreButton: {
    padding: spacing[1],
  },
  bottomSafeArea: {
    height: TAB_BAR_HEIGHT + (Platform.OS === 'ios' ? 34 : 0),
  },
});

export default FullPlayer;
