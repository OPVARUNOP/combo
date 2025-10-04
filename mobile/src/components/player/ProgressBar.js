import React from 'react';
import { View, StyleSheet, PanGestureHandler, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';

// Styles
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

const ProgressBar = ({
  progress = 0,
  duration = 100,
  buffered = 0,
  height = 4,
  onSeek,
  showTime = true,
  style,
}) => {
  const progressValue = useSharedValue((progress / duration) * 100);
  const bufferedValue = useSharedValue((buffered / duration) * 100);
  const isDragging = useSharedValue(false);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = progressValue.value;
      isDragging.value = true;
    },
    onActive: (event, ctx) => {
      const newProgress = Math.max(0, Math.min(100, ctx.startX + (event.translationX / 300) * 100));
      progressValue.value = newProgress;
    },
    onEnd: (event) => {
      isDragging.value = false;
      const newPosition = (progressValue.value / 100) * duration;

      if (onSeek) {
        runOnJS(onSeek)(newPosition);
      }
    },
  });

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value}%`,
    };
  });

  const bufferedStyle = useAnimatedStyle(() => {
    return {
      width: `${bufferedValue.value}%`,
    };
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { height }, style]}>
      {showTime && (
        <View style={styles.timeContainer}>
          <TouchableOpacity style={styles.timeButton}>
            <Text style={styles.timeText}>{formatTime(progress)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.timeButton}>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </TouchableOpacity>
        </View>
      )}

      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={styles.progressBar}>
          {/* Background */}
          <View style={[styles.background, { height }]} />

          {/* Buffered */}
          <Animated.View style={[styles.buffered, bufferedStyle, { height }]} />

          {/* Progress */}
          <Animated.View style={[styles.progress, progressStyle, { height }]}>
            <View style={[styles.thumb, { top: -6 }]} />
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    width: '100%',
  },
  buffered: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  container: {
    width: '100%',
  },
  progress: {
    alignItems: 'flex-end',
    backgroundColor: colors.primary,
    borderRadius: 2,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    top: 0,
  },
  progressBar: {
    position: 'relative',
    width: '100%',
  },
  thumb: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    elevation: 4,
    height: 12,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: 12,
  },
  timeButton: {
    padding: spacing.xs,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  timeText: {
    color: colors.text.secondary,
    fontFamily: 'monospace',
    fontSize: 12,
  },
});

export default ProgressBar;
