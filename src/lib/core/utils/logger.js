const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  info: (...args) => {
    if (isDev) console.log('[INFO]', ...args);
  },
  
  warn: (...args) => {
    console.warn('[WARN]', ...args);
  },
  
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },
  
  // Log uniquement en dev (pour debug)
  debug: (...args) => {
    if (isDev) console.log('[DEBUG]', ...args);
  }
};

export default logger;