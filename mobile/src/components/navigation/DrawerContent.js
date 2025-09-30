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
    <LinearGradient
      colors={[colors.surface, colors.background]}
      style={styles.container}
    >
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color={colors.primary} />
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
          <Ionicons name="log-out" size={24} color={colors.textSecondary} />
          <Text style={styles.bottomText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  premiumBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  premiumText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  menuSection: {
    flex: 1,
    paddingVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    marginVertical: 2,
    borderRadius: 10,
  },
  menuText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 15,
    fontWeight: '500',
  },
  bottomSection: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.white10,
  },
  bottomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  bottomText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 15,
  },
});

export default DrawerContent;
