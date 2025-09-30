import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RNFetchBlob from 'rn-fetch-blob';
import { trackAPI } from '../services/api';
import TrackPlayer from 'react-native-track-player';
import { getFileExtension } from './helpers';

const { fs } = RNFetchBlob;

export const downloadTrack = async (track) => {
  try {
    // Request storage permission
    const permission = Platform.select({
      android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      ios: PERMISSIONS.IOS.MEDIA_LIBRARY,
    });

    const status = await check(permission);
    let permissionGranted = status === RESULTS.GRANTED;
    
    if (status === RESULTS.DENIED) {
      const result = await request(permission);
      permissionGranted = result === RESULTS.GRANTED;
    }

    if (!permissionGranted) {
      throw new Error('Storage permission not granted');
    }

    // Create downloads directory if it doesn't exist
    const downloadDir = `${fs.dirs.DownloadDir}/COMBO`;
    const dirExists = await fs.exists(downloadDir);
    
    if (!dirExists) {
      await fs.mkdir(downloadDir);
    }

    // Get the stream URL for the track
    const streamUrl = track.streamUrl || track.audioUrl;
    if (!streamUrl) {
      throw new Error('No stream URL available for this track');
    }

    // Generate a safe filename
    const fileExtension = getFileExtension(streamUrl) || 'mp3';
    const fileName = `${track.id}.${fileExtension}`;
    const filePath = `${downloadDir}/${fileName}`;

    // Download the file
    const downloadTask = RNFetchBlob.config({
      path: filePath,
      fileCache: true,
      appendExt: fileExtension,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        title: `Downloading: ${track.title}`,
        description: `Downloading ${track.title} by ${track.artist}`,
        mime: `audio/${fileExtension}`,
        mediaScannable: true,
      },
    }).fetch('GET', streamUrl, {
      // Add any required headers for authentication
      Authorization: `Bearer ${await AsyncStorage.getItem('userToken')}`,
    });

    // Monitor download progress
    downloadTask.progress((received, total) => {
      const progress = received / total;
      // You can dispatch this to Redux to update the UI
      console.log(`Download progress: ${(progress * 100).toFixed(2)}%`);
    });

    const response = await downloadTask;
    
    if (response.info().status === 200) {
      // Add the downloaded track to the track player
      const downloadedTrack = {
        ...track,
        url: `file://${response.path()}`,
        isDownloaded: true,
      };

      // Save download info to track in the database
      await trackAPI.download(track.id);
      
      // Save download info to local storage
      const downloads = await getDownloads();
      downloads.push({
        id: track.id,
        path: response.path(),
        downloadedAt: new Date().toISOString(),
      });
      
      await AsyncStorage.setItem('@downloads', JSON.stringify(downloads));
      
      return { success: true, track: downloadedTrack };
    }
    
    throw new Error('Download failed');
  } catch (error) {
    console.error('Download error:', error);
    return { success: false, error: error.message };
  }
};

export const getDownloads = async () => {
  try {
    const downloads = await AsyncStorage.getItem('@downloads');
    return downloads ? JSON.parse(downloads) : [];
  } catch (error) {
    console.error('Error getting downloads:', error);
    return [];
  }
};

export const removeDownload = async (trackId) => {
  try {
    const downloads = await getDownloads();
    const download = downloads.find(d => d.id === trackId);
    
    if (download) {
      // Delete the file
      await fs.unlink(download.path);
      
      // Remove from downloads list
      const updatedDownloads = downloads.filter(d => d.id !== trackId);
      await AsyncStorage.setItem('@downloads', JSON.stringify(updatedDownloads));
      
      return { success: true };
    }
    
    return { success: false, error: 'Download not found' };
  } catch (error) {
    console.error('Error removing download:', error);
    return { success: false, error: error.message };
  }
};

export const isTrackDownloaded = async (trackId) => {
  try {
    const downloads = await getDownloads();
    return downloads.some(d => d.id === trackId);
  } catch (error) {
    console.error('Error checking if track is downloaded:', error);
    return false;
  }
};

// Helper function to get file extension from URL
const getFileExtension = (url) => {
  if (!url) return null;
  
  // Remove query parameters
  const cleanUrl = url.split('?')[0];
  
  // Get the last part after the last dot
  const match = cleanUrl.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
  return match ? match[1].toLowerCase() : null;
};
