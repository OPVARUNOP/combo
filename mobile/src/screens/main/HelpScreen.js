import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Components
import AppLogo, { BrandedHeader, BrandedCard } from '../common/AppLogo';
import { AnimatedButton } from '../common/AnimatedButton';

// Theme
import { colors, spacing, typography, radius } from '../styles/theme';

const HelpScreen = () => {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('getting-started');
  const [showModal, setShowModal] = useState(false);

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: 'play-circle',
      description: 'Learn the basics of using COMBO',
    },
    {
      id: 'search-music',
      title: 'Search & Discover',
      icon: 'search',
      description: 'Find your favorite music',
    },
    {
      id: 'playlists',
      title: 'Playlists',
      icon: 'list',
      description: 'Create and manage playlists',
    },
    {
      id: 'library',
      title: 'Your Library',
      icon: 'heart',
      description: 'Manage liked songs and artists',
    },
    {
      id: 'offline',
      title: 'Offline Music',
      icon: 'download',
      description: 'Download music for offline listening',
    },
    {
      id: 'account',
      title: 'Account & Settings',
      icon: 'settings',
      description: 'Manage your account and preferences',
    },
  ];

  const helpContent = {
    'getting-started': {
      title: 'Getting Started with COMBO',
      content: [
        {
          title: 'Welcome to COMBO!',
          description: 'COMBO is your personal music streaming companion with access to over 600,000 tracks.',
        },
        {
          title: 'Browse Music',
          description: 'Explore trending tracks, new releases, and curated playlists on the home screen.',
        },
        {
          title: 'Search for Music',
          description: 'Use the search tab to find specific songs, artists, or albums.',
        },
        {
          title: 'Create Playlists',
          description: 'Tap the + button to create your own playlists with your favorite tracks.',
        },
        {
          title: 'Like Songs',
          description: 'Tap the heart icon on any track to add it to your liked songs.',
        },
      ],
    },
    'search-music': {
      title: 'Search & Discover Music',
      content: [
        {
          title: 'Search by Text',
          description: 'Type song names, artist names, or album titles in the search bar.',
        },
        {
          title: 'Filter Results',
          description: 'Use the tabs to filter between tracks, albums, artists, and playlists.',
        },
        {
          title: 'Browse Categories',
          description: 'Explore music by genre, mood, or activity in the search filters.',
        },
        {
          title: 'Recent Searches',
          description: 'Your recent searches are saved for quick access.',
        },
        {
          title: 'Trending Music',
          description: 'Discover popular and trending tracks in your region.',
        },
      ],
    },
    'playlists': {
      title: 'Create & Manage Playlists',
      content: [
        {
          title: 'Create New Playlist',
          description: 'Tap the + button and choose "Create Playlist" to make a new collection.',
        },
        {
          title: 'Add Songs',
          description: 'Search for music and tap the + button on tracks to add them to playlists.',
        },
        {
          title: 'Edit Playlist',
          description: 'Tap the three dots on a playlist to rename, change description, or delete it.',
        },
        {
          title: 'Share Playlists',
          description: 'Make playlists public and share them with friends.',
        },
        {
          title: 'Collaborate',
          description: 'Invite friends to collaborate on playlists together.',
        },
      ],
    },
    'library': {
      title: 'Your Personal Library',
      content: [
        {
          title: 'Liked Songs',
          description: 'All your favorite tracks are saved in the "Liked Songs" playlist.',
        },
        {
          title: 'Followed Artists',
          description: 'Follow your favorite artists to get updates on new releases.',
        },
        {
          title: 'Listening History',
          description: 'View your recently played tracks in the library section.',
        },
        {
          title: 'Downloaded Music',
          description: 'Access your offline music collection when not connected to internet.',
        },
        {
          title: 'Statistics',
          description: 'View your listening statistics and achievements.',
        },
      ],
    },
    'offline': {
      title: 'Offline Music',
      content: [
        {
          title: 'Download for Offline',
          description: 'Tap the download button on any track to save it for offline listening.',
        },
        {
          title: 'Offline Queue',
          description: 'Downloaded tracks are available in your offline queue.',
        },
        {
          title: 'Storage Management',
          description: 'Manage your device storage and remove downloaded tracks when needed.',
        },
        {
          title: 'Auto-Download',
          description: 'Enable auto-download for your favorite playlists.',
        },
        {
          title: 'Sync Settings',
          description: 'Choose download quality and sync preferences in settings.',
        },
      ],
    },
    'account': {
      title: 'Account & Settings',
      content: [
        {
          title: 'Profile Settings',
          description: 'Update your profile information and preferences.',
        },
        {
          title: 'Audio Quality',
          description: 'Choose streaming quality based on your connection.',
        },
        {
          title: 'Notifications',
          description: 'Customize notification preferences for new releases and updates.',
        },
        {
          title: 'Privacy',
          description: 'Control your privacy settings and data sharing preferences.',
        },
        {
          title: 'Support',
          description: 'Get help and contact our support team.',
        },
      ],
    },
  };

  const renderHelpCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.id && styles.selectedCategory,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <View style={styles.categoryIcon}>
        <Ionicons
          name={item.icon}
          size={24}
          color={selectedCategory === item.id ? colors.white : colors.primary}
        />
      </View>
      <View style={styles.categoryContent}>
        <Text
          style={[
            styles.categoryTitle,
            { color: selectedCategory === item.id ? colors.white : colors.text },
          ]}
        >
          {item.title}
        </Text>
        <Text
          style={[
            styles.categoryDescription,
            { color: selectedCategory === item.id ? colors.white : colors.textSecondary },
          ]}
        >
          {item.description}
        </Text>
      </View>
      {selectedCategory === item.id && (
        <Ionicons name="chevron-forward" size={20} color={colors.white} />
      )}
    </TouchableOpacity>
  );

  const renderHelpContent = () => {
    const content = helpContent[selectedCategory];
    if (!content) return null;

    return (
      <View style={styles.contentContainer}>
        <Text style={styles.contentTitle}>{content.title}</Text>
        {content.content.map((item, index) => (
          <BrandedCard key={index} style={styles.contentCard}>
            <Text style={styles.contentItemTitle}>{item.title}</Text>
            <Text style={styles.contentItemDescription}>{item.description}</Text>
          </BrandedCard>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={colors.gradientBg} style={styles.gradient}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <BrandedHeader
            title="Help & Support"
            subtitle="Find answers to common questions"
            style={styles.header}
          />

          <View style={styles.content}>
            <View style={styles.categoriesContainer}>
              <Text style={styles.sectionTitle}>Help Topics</Text>
              {helpCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    selectedCategory === category.id && styles.selectedCategoryItem,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <View style={styles.categoryItemContent}>
                    <Ionicons
                      name={category.icon}
                      size={20}
                      color={selectedCategory === category.id ? colors.white : colors.primary}
                    />
                    <Text
                      style={[
                        styles.categoryItemText,
                        {
                          color: selectedCategory === category.id ? colors.white : colors.text,
                        },
                      ]}
                    >
                      {category.title}
                    </Text>
                  </View>
                  {selectedCategory === category.id && (
                    <Ionicons name="chevron-forward" size={16} color={colors.white} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.helpContent}>
              {renderHelpContent()}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <AnimatedButton
            title="Contact Support"
            onPress={() => setShowModal(true)}
            variant="outline"
            icon="mail"
            style={styles.supportButton}
          />
        </View>
      </LinearGradient>

      {/* Support Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Contact Support</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <BrandedCard style={styles.supportCard}>
              <Text style={styles.supportTitle}>Get Help</Text>
              <Text style={styles.supportDescription}>
                Need help with something specific? Our support team is here to help you get the most out of COMBO.
              </Text>

              <View style={styles.supportOptions}>
                <TouchableOpacity style={styles.supportOption}>
                  <Ionicons name="mail" size={24} color={colors.primary} />
                  <Text style={styles.supportOptionText}>Email Support</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.supportOption}>
                  <Ionicons name="chatbubble" size={24} color={colors.primary} />
                  <Text style={styles.supportOptionText}>Live Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.supportOption}>
                  <Ionicons name="help-circle" size={24} color={colors.primary} />
                  <Text style={styles.supportOptionText}>FAQ</Text>
                </TouchableOpacity>
              </View>
            </BrandedCard>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.xl,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  categoriesContainer: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  selectedCategoryItem: {
    backgroundColor: colors.primary,
  },
  categoryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryItemText: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },
  helpContent: {
    flex: 1,
  },
  contentContainer: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  contentTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  contentCard: {
    marginBottom: spacing.md,
  },
  contentItemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  contentItemDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.card,
  },
  supportButton: {
    marginBottom: spacing.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  supportCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  supportTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  supportDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  supportOptions: {
    width: '100%',
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  supportOptionText: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    color: colors.text,
    marginLeft: spacing.md,
  },
});

export default HelpScreen;
