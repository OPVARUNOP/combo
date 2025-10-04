import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { colors } from '../constants/theme';

// Mock data for library items
const libraryItems = [
  { id: '1', title: 'Liked Songs', count: '120 songs', type: 'playlist', image: 'https://via.placeholder.com/60' },
  { id: '2', title: 'My Playlist #1', count: '45 songs', type: 'playlist', image: 'https://via.placeholder.com/60' },
  { id: '3', title: 'Workout Mix', count: '30 songs', type: 'playlist', image: 'https://via.placeholder.com/60' },
  { id: '4', title: 'Chill Vibes', count: '28 songs', type: 'playlist', image: 'https://via.placeholder.com/60' },
  { id: '5', title: 'Rock Classics', count: '85 songs', type: 'playlist', image: 'https://via.placeholder.com/60' },
];

const LibraryScreen = () => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemSubtitle} numberOfLines={1}>
          {item.type} • {item.count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Library</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Recent</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>A-Z</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={libraryItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.card,
    borderRadius: 16,
  },
  actionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 80, // Space for the add button
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    color: 'white',
    fontSize: 30,
    lineHeight: 32,
    marginTop: -2,
  },
});

export default LibraryScreen;
