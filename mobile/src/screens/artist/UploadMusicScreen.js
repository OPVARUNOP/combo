import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

// Theme
import { colors, spacing, typography, radius } from '../../styles/theme';

// Redux
import { addRecentActivity } from '../../store/slices/personalizationSlice';

const UploadMusicScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [uploadType, setUploadType] = useState('single'); // 'single' or 'album'
  const [trackTitle, setTrackTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [albumTitle, setAlbumTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [isExplicit, setIsExplicit] = useState(false);

  const [audioFile, setAudioFile] = useState(null);
  const [artworkFile, setArtworkFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const genres = [
    'Pop',
    'Rock',
    'Hip-Hop',
    'Electronic',
    'Jazz',
    'Classical',
    'Country',
    'R&B',
    'Indie',
    'Alternative',
    'Folk',
    'Blues',
  ];

  const handlePickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'audio/mpeg', 'audio/wav', 'audio/mp3'],
        copyToCacheDirectory: false,
      });

      if (result.type === 'success') {
        setAudioFile(result);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  const handlePickArtwork = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setArtworkFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick artwork');
    }
  };

  const validateForm = () => {
    if (!trackTitle.trim()) {
      Alert.alert('Error', 'Track title is required');
      return false;
    }
    if (!artistName.trim()) {
      Alert.alert('Error', 'Artist name is required');
      return false;
    }
    if (!audioFile) {
      Alert.alert('Error', 'Audio file is required');
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Track upload activity
      dispatch(
        addRecentActivity({
          type: 'content_upload',
          contentType: uploadType,
          title: trackTitle,
          timestamp: new Date().toISOString(),
        }),
      );

      Alert.alert(
        'Success',
        `${uploadType === 'single' ? 'Track' : 'Album'} uploaded successfully!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      Alert.alert('Error', 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name='arrow-back' size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Upload Music</Text>
      <View style={styles.headerRight} />
    </View>
  );

  const renderUploadTypeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Upload Type</Text>
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, uploadType === 'single' && styles.typeButtonActive]}
          onPress={() => setUploadType('single')}
        >
          <Ionicons
            name='musical-note'
            size={20}
            color={uploadType === 'single' ? colors.text : colors.textSecondary}
          />
          <Text
            style={[styles.typeButtonText, uploadType === 'single' && styles.typeButtonTextActive]}
          >
            Single Track
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, uploadType === 'album' && styles.typeButtonActive]}
          onPress={() => setUploadType('album')}
        >
          <Ionicons
            name='disc'
            size={20}
            color={uploadType === 'album' ? colors.text : colors.textSecondary}
          />
          <Text
            style={[styles.typeButtonText, uploadType === 'album' && styles.typeButtonTextActive]}
          >
            Album
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Track Information</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Track Title *</Text>
        <TextInput
          style={styles.textInput}
          value={trackTitle}
          onChangeText={setTrackTitle}
          placeholder='Enter track title'
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Artist Name *</Text>
        <TextInput
          style={styles.textInput}
          value={artistName}
          onChangeText={setArtistName}
          placeholder='Enter artist name'
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {uploadType === 'album' && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Album Title</Text>
          <TextInput
            style={styles.textInput}
            value={albumTitle}
            onChangeText={setAlbumTitle}
            placeholder='Enter album title'
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Genre</Text>
        <TouchableOpacity style={styles.genreSelector}>
          <Text style={genre ? styles.genreText : styles.genrePlaceholder}>
            {genre || 'Select genre'}
          </Text>
          <Ionicons name='chevron-down' size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder='Tell listeners about this track...'
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Release Date</Text>
        <TextInput
          style={styles.textInput}
          value={releaseDate}
          onChangeText={setReleaseDate}
          placeholder='YYYY-MM-DD'
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <TouchableOpacity
        style={[styles.checkbox, isExplicit && styles.checkboxActive]}
        onPress={() => setIsExplicit(!isExplicit)}
      >
        <Ionicons
          name={isExplicit ? 'checkbox' : 'square-outline'}
          size={20}
          color={isExplicit ? colors.primary : colors.textSecondary}
        />
        <Text style={styles.checkboxText}>Contains explicit content</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFileUploads = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Upload Files</Text>

      <TouchableOpacity style={styles.uploadButton} onPress={handlePickAudio}>
        <Ionicons name='musical-notes' size={24} color={colors.primary} />
        <View style={styles.uploadContent}>
          <Text style={styles.uploadTitle}>{audioFile ? audioFile.name : 'Select Audio File'}</Text>
          <Text style={styles.uploadSubtitle}>
            {audioFile ? `${(audioFile.size / 1024 / 1024).toFixed(1)} MB` : 'MP3, WAV up to 100MB'}
          </Text>
        </View>
        <Ionicons name='chevron-forward' size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.uploadButton} onPress={handlePickArtwork}>
        <Ionicons name='image' size={24} color={colors.primary} />
        <View style={styles.uploadContent}>
          <Text style={styles.uploadTitle}>
            {artworkFile ? 'Artwork Selected' : 'Upload Artwork'}
          </Text>
          <Text style={styles.uploadSubtitle}>Square image, at least 1000x1000px</Text>
        </View>
        <Ionicons name='chevron-forward' size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const renderUploadButton = () => (
    <TouchableOpacity
      style={[styles.submitButton, isUploading && styles.submitButtonDisabled]}
      onPress={handleUpload}
      disabled={isUploading}
    >
      <Text style={styles.submitButtonText}>
        {isUploading ? 'Uploading...' : `Upload ${uploadType === 'single' ? 'Track' : 'Album'}`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {renderHeader()}

      {renderUploadTypeSelector()}
      {renderForm()}
      {renderFileUploads()}
      {renderUploadButton()}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bottomSpacing: {
    height: 100,
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  checkboxActive: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
    borderWidth: 1,
  },
  checkboxText: {
    color: colors.text,
    fontSize: typography.fontSize.base,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  genrePlaceholder: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
  },
  genreSelector: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.elevated,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  genreText: {
    color: colors.text,
    fontSize: typography.fontSize.base,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing['3xl'] : spacing.xl,
  },
  headerRight: {
    width: 24,
  },
  headerTitle: {
    color: colors.text,
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  submitButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  textInput: {
    backgroundColor: colors.surface,
    borderColor: colors.elevated,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.fontSize.base,
    padding: spacing.md,
  },
  typeButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: colors.text,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  uploadContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  uploadSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  uploadTitle: {
    color: colors.text,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
});

export default UploadMusicScreen;
