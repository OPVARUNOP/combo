import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// Theme
import { colors, spacing, typography, radius } from '../../styles/theme';

const DrawerContent = (props) => {
  const navigation = useNavigation();

  // Mock user data - replace with actual user data from your state
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    isPremium: true,
  };

  const menuItems = [
    { icon: 'home', label: 'Home', screen: 'Home' },
    { icon: 'search', label: 'Search', screen: 'Search' },
    { icon: 'library', label: 'Library', screen: 'Library' },
    { icon: 'heart', label: 'Liked Songs', screen: 'LikedSongs' },
    { icon: 'download', label: 'Downloads', screen: 'Downloads' },
    { icon: 'user', label: 'Profile', screen: 'Profile' },
    { icon: 'settings', label: 'Settings', screen: 'Settings' },
    { icon: 'help-circle', label: 'Help & Support', screen: 'Help' },
  ];

  const handleMenuPress = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <LinearGradient colors={[colors.surface, colors.background]} style={styles.container}>
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Ionicons name='person' size={40} color={colors.primary} />
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        {user.isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.screen)}
          >
            <Ionicons name={item.icon} size={24} color={colors.text} />
            <Text style={styles.menuText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.bottomItem}>
          <Ionicons name='log-out' size={24} color={colors.textSecondary} />
          <Text style={styles.bottomText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    backgroundColor: colors.elevated,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 15,
    width: 80,
  },
  bottomItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 10,
  },
  bottomSection: {
    borderTopColor: colors.white10,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  bottomText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginLeft: 15,
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  menuItem: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 2,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  menuSection: {
    flex: 1,
    paddingVertical: 20,
  },
  menuText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 15,
  },
  premiumBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  premiumText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  profileSection: {
    alignItems: 'center',
    borderBottomColor: colors.white10,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  userName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
});

export default DrawerContent;
