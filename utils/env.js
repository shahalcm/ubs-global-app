/**
 * Helper to retrieve environment variables safely.
 * Safeguards against variables compiled as literal strings "undefined" or "null" by bundlers.
 */
export const getEnv = (key, fallback = '') => {
  const value = process.env[key];
  if (
    !value ||
    value === 'undefined' ||
    value === 'null' ||
    value.trim() === ''
  ) {
    return fallback;
  }
  return value.trim();
};
