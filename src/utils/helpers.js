/**
 * Formats a timestamp (ms since epoch) into a short HH:MM display string.
 */
export function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Builds a new message object with a consistent shape used
 * throughout the app and in persisted storage.
 */
export function createMessage({ id, role, content, status = 'sent' }) {
  return {
    id,
    role, // 'user' | 'assistant'
    content,
    status, // 'sending' | 'sent' | 'error'
    timestamp: Date.now(),
  };
}
