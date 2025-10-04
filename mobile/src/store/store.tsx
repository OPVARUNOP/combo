import { configureStore, combineReducers } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist';

// Slices
import authSlice from './slices/authSlice';
import playerSlice from './slices/playerSlice';
import librarySlice from './slices/librarySlice';
import searchSlice from './slices/searchSlice';
import userSlice from './slices/userSlice';
import settingsSlice from './slices/settingsSlice';
import socialSlice from './slices/socialSlice';
import personalizationSlice from './slices/personalizationSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'settings', 'library', 'personalization'], // Only persist these slices
};

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  player: playerSlice,
  library: librarySlice,
  search: searchSlice,
  user: userSlice,
  settings: settingsSlice,
  social: socialSlice,
  personalization: personalizationSlice,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
