import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

// Mock user data
const user = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://via.placeholder.com/100',
  stats: {
    playlists: 12,
    followers: 456,
    following: 123,
  },
};

// Mock menu items
const menuItems = [
  { id: '1', icon: 'person-outline', label: 'Edit Profile' },
  { id: '2', icon: 'notifications-outline', label: 'Notifications' },
  { id: '3', icon: 'settings-outline', label: 'Settings' },
  { id: '4', icon: 'help-circle-outline', label: 'Help & Support' },
  { id: '5', icon: 'information-circle-outline', label: 'About' },
  { id: '6', icon: 'log-out-outline', label: 'Logout', color: colors.error },
];

const ProfileScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.stats.playlists}</Text>
            <Text style={styles.statLabel}>Playlists</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.stats.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.stats.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>
      
      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.menuItem}
            onPress={() => console.log(`Pressed ${item.label}`)}
          >
            <Ionicons 
              name={item.icon as any} 
              size={24} 
              color={item.color || colors.text} 
              style={styles.menuIcon} 
            />
            <Text style={[styles.menuText, item.color && { color: item.color }]}>
              {item.label}
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={colors.textSecondary} 
              style={styles.menuArrow} 
            />
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 30,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  menuArrow: {
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  versionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default ProfileScreen;
