import React from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions;

const AlbumArt = ({ source, size = 200, style, blur = false, animated = true, onPress }) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const { playbackState } = useSelector((state) => state.player);

  React.useEffect(() => {
    if (animated && playbackState.isPlaying) {
      rotation.value = withRepeat(withTiming(360, { duration: 10000 }), -1, false);
    } else {
      rotation.value = withTiming(0);
    }
  }, [playbackState.isPlaying, animated]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
    };
  });

  const handlePress = () => {
    if (onPress) {
      scale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withTiming(1, { duration: 100 }),
      );
      onPress();
    }
  };

  const imageStyle = [
    styles.image,
    {
      width: size,
      height: size,
      borderRadius: size * 0.1,
    },
    blur && styles.blur,
    style,
  ];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <Animated.View style={[styles.animatedContainer, animatedStyle]}>
        {blur ? (
          <View style={styles.blurContainer}>
            <Image source={{ uri: source }} style={imageStyle} blurRadius={20} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
              style={styles.gradient}
            />
          </View>
        ) : (
          <Image source={{ uri: source }} style={imageStyle} resizeMode='cover' />
        )}

        {/* Vinyl effect for playing state */}
        {animated && playbackState.isPlaying && (
          <View style={styles.vinylEffect}>
            <View style={styles.vinylCenter} />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  blur: {
    opacity: 0.6,
  },
  blurContainer: {
    position: 'relative',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    backgroundColor: '#333',
  },
  vinylCenter: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    elevation: 10,
    height: 20,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    width: 20,
  },
  vinylEffect: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: width * 0.35,
    borderWidth: 2,
    justifyContent: 'center',
  },
});

export default AlbumArt;
