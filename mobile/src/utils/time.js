// Convert milliseconds to { minutes, seconds } object
export const msToTime = (ms) => {
  if (!ms && ms !== 0) {
    return { minutes: 0, seconds: 0 };
  }

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return { minutes, seconds };
};

// Format milliseconds to MM:SS format
export const formatTime = (ms) => {
  if (!ms && ms !== 0) {
    return '--:--';
  }

  const { minutes, seconds } = msToTime(ms);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Format milliseconds to human-readable duration (e.g., "2 minutes 30 seconds")
export const formatDuration = (ms) => {
  if (!ms && ms !== 0) {
    return '';
  }

  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];

  if (days > 0) {
    parts.push(`${days} day${days > 1 ? 's' : ''}`);
  }

  if (hours > 0) {
    parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  }

  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
  }

  return parts.join(' ');
};

// Get relative time from a date (e.g., "2 hours ago")
export const getRelativeTime = (dateString) => {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return `${interval} year${interval === 1 ? '' : 's'} ago`;
  }

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return `${interval} month${interval === 1 ? '' : 's'} ago`;
  }

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return `${interval} day${interval === 1 ? '' : 's'} ago`;
  }

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return `${interval} hour${interval === 1 ? '' : 's'} ago`;
  }

  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return `${interval} minute${interval === 1 ? '' : 's'} ago`;
  }

  return 'just now';
};

// Format a date to a specific format
export const formatDate = (dateString, format = 'en-US') => {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);

  return date.toLocaleDateString(format, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Get the start of the day (00:00:00) for a given date
export const getStartOfDay = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

// Get the end of the day (23:59:59) for a given date
export const getEndOfDay = (date = new Date()) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

// Check if a date is today
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);

  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

// Check if a date is yesterday
export const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const checkDate = new Date(date);

  return (
    checkDate.getDate() === yesterday.getDate() &&
    checkDate.getMonth() === yesterday.getMonth() &&
    checkDate.getFullYear() === yesterday.getFullYear()
  );
};

// Get the difference between two dates in days
export const getDaysDifference = (date1, date2 = new Date()) => {
  const diffTime = Math.abs(new Date(date2) - new Date(date1));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
