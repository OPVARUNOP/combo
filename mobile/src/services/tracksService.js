import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export const fetchTracks = async () => {
  const querySnapshot = await getDocs(collection(db, 'tracks'));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Add more Firestore-based functions as needed for albums, artists, playlists, etc.
