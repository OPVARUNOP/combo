import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  RepeatMode,
  State,
} from 'react-native-track-player';

export const setupPlayer = async () => {
  try {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      // Media controls capabilities
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
        Capability.SeekTo,
      ],
      
      // Capabilities that will show up when the notification is in the compact form on Android
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],

      // The media controls
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
      
      // Android only: Audio buffer configuration
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      
      // The buttons that will appear in the notification (Android)
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      
      // Whether the audio playback should continue running when the app goes into the background
      stopWithApp: false,
      
      // An array of media controls to show in the notification
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
    });
    
    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
    
    return true;
  } catch (error) {
    console.error('Error setting up player:', error);
    return false;
  }
};

export const addTracks = async (tracks) => {
  try {
    // Clear the queue first
    await TrackPlayer.reset();
    
    // Add tracks to the queue
    await TrackPlayer.add(tracks);
    return true;
  } catch (error) {
    console.error('Error adding tracks:', error);
    return false;
  }
};

export const playbackService = async () => {
  // This service is required to run in the background
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => TrackPlayer.seekTo(position));
  
  // Handle when the queue has ended
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, ({ track }) => {
    // You might want to implement autoplay for the next track in the queue
    console.log('Queue ended', track);
  });
  
  // Handle track change
  TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async ({ nextTrack }) => {
    if (nextTrack !== null) {
      const track = await TrackPlayer.getTrack(nextTrack);
      console.log('Now playing:', track);
    }
  });
};
