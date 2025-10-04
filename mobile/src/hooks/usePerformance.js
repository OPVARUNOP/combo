import { useEffect, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  const renderStartTime = useRef(Date.now());
  const [renderTime, setRenderTime] = useState(0);

  useEffect(() => {
    const endTime = Date.now();
    const duration = endTime - renderStartTime.current;
    setRenderTime(duration);

    // Log slow renders in development
    if (__DEV__ && duration > 16) {
      // More than 1 frame at 60fps
      console.warn(`Slow render detected in ${componentName}: ${duration}ms`);
    }

    // In production, you could send this to analytics
    // Example: analytics.track('component_render_time', { component: componentName, duration });
  });

  return renderTime;
};

// Debounce hook for search and API calls
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for scroll events
export const useThrottle = (callback, delay) => {
  const lastRan = useRef(Date.now());

  return (...args) => {
    if (Date.now() - lastRan.current >= delay) {
      callback(...args);
      lastRan.current = Date.now();
    }
  };
};

// Memory usage monitoring (development only)
export const useMemoryMonitor = () => {
  const [memoryUsage, setMemoryUsage] = useState(null);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    const updateMemoryUsage = () => {
      // This is a simplified memory monitoring approach
      // In production, you might use more sophisticated monitoring
      const usage = process.memoryUsage ? process.memoryUsage() : null;
      setMemoryUsage(usage);
    };

    const interval = setInterval(updateMemoryUsage, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryUsage;
};

// Network status hook
export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    // This would integrate with react-native-netinfo
    // For now, we'll use a simplified approach
    const checkConnection = () => {
      // Simplified connection check
      // In real implementation, use NetInfo from @react-native-community/netinfo
      setIsConnected(navigator.onLine || true);
      setConnectionType('wifi'); // Would detect actual connection type
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return { isConnected, connectionType };
};

// Interaction manager hook for handling heavy operations
export const useInteractionManager = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });
  }, []);

  return isReady;
};

// Image preloading hook
export const useImagePreloader = (imageUrls) => {
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const preloadImages = async () => {
      setLoading(true);
      const loaded = new Set();

      for (const url of imageUrls) {
        try {
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              loaded.add(url);
              resolve();
            };
            img.onerror = reject;
            img.src = url;
          });
        } catch (error) {
          console.warn(`Failed to preload image: ${url}`);
        }
      }

      setLoadedImages(loaded);
      setLoading(false);
    };

    if (imageUrls.length > 0) {
      preloadImages();
    }
  }, [imageUrls]);

  return { loadedImages, loading };
};
