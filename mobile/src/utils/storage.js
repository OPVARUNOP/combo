import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys
const TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@refresh_token';
const USER_KEY = '@user_data';
const SETTINGS_KEY = '@app_settings';
const RECENT_SEARCHES_KEY = '@recent_searches';

// Token storage
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const setToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error setting auth token:', error);
    return false;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('Error removing auth token:', error);
    return false;
  }
};

// Refresh token storage
export const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

export const setRefreshToken = async (token) => {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error setting refresh token:', error);
    return false;
  }
};

export const removeRefreshToken = async () => {
  try {
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('Error removing refresh token:', error);
    return false;
  }
};

// User data storage
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const setUserData = async (userData) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error setting user data:', error);
    return false;
  }
};

export const removeUserData = async () => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
    return true;
  } catch (error) {
    console.error('Error removing user data:', error);
    return false;
  }
};

// App settings storage
export const getAppSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(SETTINGS_KEY);
    return settings ? JSON.parse(settings) : {};
  } catch (error) {
    console.error('Error getting app settings:', error);
    return {};
  }
};

export const setAppSettings = async (settings) => {
  try {
    const currentSettings = await getAppSettings();
    const newSettings = { ...currentSettings, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    return true;
  } catch (error) {
    console.error('Error setting app settings:', error);
    return false;
  }
};

// Recent searches storage
export const getRecentSearches = async () => {
  try {
    const searches = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    return searches ? JSON.parse(searches) : [];
  } catch (error) {
    console.error('Error getting recent searches:', error);
    return [];
  }
};

export const addRecentSearch = async (query) => {
  try {
    if (!query || typeof query !== 'string') {
      return false;
    }

    const searches = await getRecentSearches();
    const updatedSearches = [
      query,
      ...searches.filter((item) => item.toLowerCase() !== query.toLowerCase()),
    ].slice(0, 10); // Keep only the 10 most recent searches

    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
    return true;
  } catch (error) {
    console.error('Error adding recent search:', error);
    return false;
  }
};

export const clearRecentSearches = async () => {
  try {
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing recent searches:', error);
    return false;
  }
};

// Generic storage functions
export const getItem = async (key) => {
  try {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting item with key ${key}:`, error);
    return null;
  }
};

export const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting item with key ${key}:`, error);
    return false;
  }
};

export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item with key ${key}:`, error);
    return false;
  }
};

// Clear all app data (use with caution!)
export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing all storage:', error);
    return false;
  }
};
