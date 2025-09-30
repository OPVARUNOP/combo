import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';

// Services
import { settingsAPI, authAPI } from '../services/api';

// Theme
import { colors, spacing, typography, radius } from '../styles/theme';

const { width } = Dimensions.get('window');

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    // Audio settings
    audioQuality: 'high',
    downloadQuality: 'high',
    streamingQuality: 'high',
    equalizerEnabled: false,
    volumeNormalization: true,
    gaplessPlayback: true,

    // Playback settings
    autoplay: true,
    crossfade: false,
    crossfadeDuration: 3,
    repeatMode: 'off', // 'off', 'one', 'all'
    shuffleMode: false,

    // Download settings
    downloadOverWifi: true,
    downloadOverCellular: false,
    autoDownloadLiked: false,
    storageLocation: 'internal',

    // Notification settings
    pushNotifications: true,
    newMusicNotifications: true,
    friendActivityNotifications: true,
    playlistUpdateNotifications: false,

    // Privacy settings
    privateProfile: false,
    showListeningActivity: true,
    allowMessages: true,
    dataCollection: true,

    // Display settings
    theme: 'dark', // 'light', 'dark', 'system'
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',

    // Social settings
    shareListeningActivity: true,
    sharePlaylists: true,
    shareTracks: true,
    allowTagging: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings({ ...settings, ...JSON.parse(savedSettings) });
      }

      // Load from API if available
      const response = await settingsAPI.getSettings();
      if (response.data.settings) {
        setSettings({ ...settings, ...response.data.settings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      // Save to local storage
      await AsyncStorage.setItem('userSettings', JSON.stringify(updatedSettings));

      // Save to API
      await settingsAPI.updateSettings(updatedSettings);

      // Apply settings immediately where possible
      applySettings(updatedSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const applySettings = (newSettings) => {
    // Apply theme changes
    if (newSettings.theme !== settings.theme) {
      // Trigger theme change in the app
      console.log('Theme changed to:', newSettings.theme);
    }

    // Apply audio settings
    if (newSettings.audioQuality !== settings.audioQuality) {
      console.log('Audio quality changed to:', newSettings.audioQuality);
    }

    // Apply notification settings
    if (newSettings.pushNotifications !== settings.pushNotifications) {
      console.log('Push notifications:', newSettings.pushNotifications ? 'enabled' : 'disabled');
    }
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const defaultSettings = {
                audioQuality: 'high',
                downloadQuality: 'high',
                streamingQuality: 'high',
                equalizerEnabled: false,
                volumeNormalization: true,
                gaplessPlayback: true,
                autoplay: true,
                crossfade: false,
                crossfadeDuration: 3,
                repeatMode: 'off',
                shuffleMode: false,
                downloadOverWifi: true,
                downloadOverCellular: false,
                autoDownloadLiked: false,
                storageLocation: 'internal',
                pushNotifications: true,
                newMusicNotifications: true,
                friendActivityNotifications: true,
                playlistUpdateNotifications: false,
                privateProfile: false,
                showListeningActivity: true,
                allowMessages: true,
                dataCollection: true,
                theme: 'dark',
                language: 'en',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h',
                shareListeningActivity: true,
                sharePlaylists: true,
                shareTracks: true,
                allowTagging: true,
              };

              await saveSettings(defaultSettings);
              Alert.alert('Success', 'Settings have been reset to default.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset settings.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authAPI.logout();
              await AsyncStorage.clear();
              // Navigate to auth screen
              navigation.navigate('Auth');
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const SettingsHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.headerRight} />
    </View>
  );

  const SettingsSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingsItem = ({
    title,
    subtitle,
    icon,
    iconColor = colors.primary,
    onPress,
    rightComponent,
    showArrow = true,
  }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.itemSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>

      <View style={styles.itemRight}>
        {rightComponent}
        {showArrow && onPress && (
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  const SettingsSwitch = ({
    title,
    subtitle,
    value,
    onValueChange,
    icon,
    iconColor = colors.primary,
  }) => (
    <View style={styles.settingsItem}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.itemSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.white20, true: colors.primary }}
        thumbColor={value ? colors.white : colors.textSecondary}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={colors.gradientBg}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <SettingsHeader />

        {/* Account Settings */}
        <SettingsSection title="Account">
          <SettingsItem
            title="Profile"
            subtitle="Manage your profile information"
            icon="person-outline"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <SettingsItem
            title="Subscription"
            subtitle="Manage your premium subscription"
            icon="star-outline"
            onPress={() => navigation.navigate('Subscription')}
          />
          <SettingsItem
            title="Privacy"
            subtitle="Control your privacy settings"
            icon="lock-closed-outline"
            onPress={() => navigation.navigate('PrivacySettings')}
          />
          <SettingsItem
            title="Security"
            subtitle="Manage your account security"
            icon="shield-checkmark-outline"
            onPress={() => navigation.navigate('SecuritySettings')}
          />
        </SettingsSection>

        {/* Audio Settings */}
        <SettingsSection title="Audio">
          <SettingsItem
            title="Audio Quality"
            subtitle={settings.audioQuality === 'high' ? 'High (320 kbps)' :
                   settings.audioQuality === 'medium' ? 'Medium (160 kbps)' : 'Low (96 kbps)'}
            icon="musical-notes-outline"
            onPress={() => {
              const qualities = ['low', 'medium', 'high'];
              const currentIndex = qualities.indexOf(settings.audioQuality);
              const nextQuality = qualities[(currentIndex + 1) % qualities.length];
              saveSettings({ audioQuality: nextQuality });
            }}
          />
          <SettingsItem
            title="Streaming Quality"
            subtitle={settings.streamingQuality === 'high' ? 'High' :
                   settings.streamingQuality === 'medium' ? 'Medium' : 'Low'}
            icon="radio-outline"
            onPress={() => {
              const qualities = ['low', 'medium', 'high'];
              const currentIndex = qualities.indexOf(settings.streamingQuality);
              const nextQuality = qualities[(currentIndex + 1) % qualities.length];
              saveSettings({ streamingQuality: nextQuality });
            }}
          />
          <SettingsItem
            title="Download Quality"
            subtitle={settings.downloadQuality === 'high' ? 'High (320 kbps)' :
                   settings.downloadQuality === 'medium' ? 'Medium (160 kbps)' : 'Low (96 kbps)'}
            icon="download-outline"
            onPress={() => {
              const qualities = ['low', 'medium', 'high'];
              const currentIndex = qualities.indexOf(settings.downloadQuality);
              const nextQuality = qualities[(currentIndex + 1) % qualities.length];
              saveSettings({ downloadQuality: nextQuality });
            }}
          />
          <SettingsSwitch
            title="Volume Normalization"
            subtitle="Automatically adjust volume levels"
            value={settings.volumeNormalization}
            onValueChange={(value) => saveSettings({ volumeNormalization: value })}
            icon="volume-high-outline"
          />
          <SettingsSwitch
            title="Gapless Playback"
            subtitle="Seamless playback between tracks"
            value={settings.gaplessPlayback}
            onValueChange={(value) => saveSettings({ gaplessPlayback: value })}
            icon="infinite-outline"
          />
        </SettingsSection>

        {/* Playback Settings */}
        <SettingsSection title="Playback">
          <SettingsSwitch
            title="Autoplay"
            subtitle="Automatically play similar songs"
            value={settings.autoplay}
            onValueChange={(value) => saveSettings({ autoplay: value })}
            icon="play-skip-forward-outline"
          />
          <SettingsSwitch
            title="Crossfade"
            subtitle={`Fade between songs (${settings.crossfadeDuration}s)`}
            value={settings.crossfade}
            onValueChange={(value) => saveSettings({ crossfade: value })}
            icon="swap-horizontal-outline"
          />
          <SettingsItem
            title="Repeat Mode"
            subtitle={settings.repeatMode === 'off' ? 'Off' :
                   settings.repeatMode === 'one' ? 'One' : 'All'}
            icon="repeat-outline"
            onPress={() => {
              const modes = ['off', 'one', 'all'];
              const currentIndex = modes.indexOf(settings.repeatMode);
              const nextMode = modes[(currentIndex + 1) % modes.length];
              saveSettings({ repeatMode: nextMode });
            }}
          />
        </SettingsSection>

        {/* Download Settings */}
        <SettingsSection title="Downloads">
          <SettingsSwitch
            title="Download over Wi-Fi only"
            subtitle="Save mobile data"
            value={settings.downloadOverWifi}
            onValueChange={(value) => saveSettings({ downloadOverWifi: value })}
            icon="wifi-outline"
          />
          <SettingsSwitch
            title="Download over cellular"
            subtitle="Use mobile data for downloads"
            value={settings.downloadOverCellular}
            onValueChange={(value) => saveSettings({ downloadOverCellular: value })}
            icon="cellular-outline"
          />
          <SettingsSwitch
            title="Auto-download liked songs"
            subtitle="Automatically download songs you like"
            value={settings.autoDownloadLiked}
            onValueChange={(value) => saveSettings({ autoDownloadLiked: value })}
            icon="heart-outline"
          />
          <SettingsItem
            title="Storage Location"
            subtitle={settings.storageLocation === 'internal' ? 'Internal Storage' : 'External SD Card'}
            icon="folder-outline"
            onPress={() => {
              const location = settings.storageLocation === 'internal' ? 'external' : 'internal';
              saveSettings({ storageLocation: location });
            }}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingsSwitch
            title="Push Notifications"
            subtitle="Receive push notifications"
            value={settings.pushNotifications}
            onValueChange={(value) => saveSettings({ pushNotifications: value })}
            icon="notifications-outline"
          />
          <SettingsSwitch
            title="New Music Notifications"
            subtitle="Get notified about new releases"
            value={settings.newMusicNotifications}
            onValueChange={(value) => saveSettings({ newMusicNotifications: value })}
            icon="musical-note-outline"
          />
          <SettingsSwitch
            title="Friend Activity"
            subtitle="See what your friends are listening to"
            value={settings.friendActivityNotifications}
            onValueChange={(value) => saveSettings({ friendActivityNotifications: value })}
            icon="people-outline"
          />
          <SettingsSwitch
            title="Playlist Updates"
            subtitle="Get notified when playlists are updated"
            value={settings.playlistUpdateNotifications}
            onValueChange={(value) => saveSettings({ playlistUpdateNotifications: value })}
            icon="list-outline"
          />
        </SettingsSection>

        {/* Display */}
        <SettingsSection title="Display">
          <SettingsItem
            title="Theme"
            subtitle={settings.theme === 'light' ? 'Light' :
                   settings.theme === 'dark' ? 'Dark' : 'System'}
            icon="color-palette-outline"
            onPress={() => {
              const themes = ['light', 'dark', 'system'];
              const currentIndex = themes.indexOf(settings.theme);
              const nextTheme = themes[(currentIndex + 1) % themes.length];
              saveSettings({ theme: nextTheme });
            }}
          />
          <SettingsItem
            title="Language"
            subtitle={settings.language === 'en' ? 'English' :
                   settings.language === 'es' ? 'Spanish' : 'French'}
            icon="language-outline"
            onPress={() => {
              const languages = ['en', 'es', 'fr'];
              const currentIndex = languages.indexOf(settings.language);
              const nextLanguage = languages[(currentIndex + 1) % languages.length];
              saveSettings({ language: nextLanguage });
            }}
          />
        </SettingsSection>

        {/* Social */}
        <SettingsSection title="Social">
          <SettingsSwitch
            title="Share Listening Activity"
            subtitle="Let others see what you're listening to"
            value={settings.shareListeningActivity}
            onValueChange={(value) => saveSettings({ shareListeningActivity: value })}
            icon="eye-outline"
          />
          <SettingsSwitch
            title="Share Playlists"
            subtitle="Allow others to see your playlists"
            value={settings.sharePlaylists}
            onValueChange={(value) => saveSettings({ sharePlaylists: value })}
            icon="share-social-outline"
          />
          <SettingsSwitch
            title="Share Tracks"
            subtitle="Allow others to see individual tracks"
            value={settings.shareTracks}
            onValueChange={(value) => saveSettings({ shareTracks: value })}
            icon="musical-notes-outline"
          />
          <SettingsSwitch
            title="Allow Tagging"
            subtitle="Let others tag you in posts"
            value={settings.allowTagging}
            onValueChange={(value) => saveSettings({ allowTagging: value })}
            icon="pricetag-outline"
          />
        </SettingsSection>

        {/* Support */}
        <SettingsSection title="Support">
          <SettingsItem
            title="Help & Support"
            subtitle="Get help and contact support"
            icon="help-circle-outline"
            onPress={() => navigation.navigate('HelpSupport')}
          />
          <SettingsItem
            title="Report a Problem"
            subtitle="Report bugs or issues"
            icon="bug-outline"
            onPress={() => navigation.navigate('ReportProblem')}
          />
          <SettingsItem
            title="About COMBO"
            subtitle={`Version ${require('../../package.json').version}`}
            icon="information-circle-outline"
            onPress={() => navigation.navigate('About')}
          />
        </SettingsSection>

        {/* Account Actions */}
        <SettingsSection title="Account">
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={resetSettings}
          >
            <Text style={styles.dangerButtonText}>Reset Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleLogout}
          >
            <Text style={styles.dangerButtonText}>Logout</Text>
          </TouchableOpacity>
        </SettingsSection>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradientBackground: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing['3xl'] : spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 2,
  },
  backButton: {
    padding: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: colors.error + '20',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default SettingsScreen;
