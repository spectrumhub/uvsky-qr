/**
 * Application Configuration
 * Loads environment variables with fallbacks and validation
 */

const getEnvVariable = (key, defaultValue = null) => {
  const value = import.meta.env[`VITE_${key}`] || defaultValue;
  if (!value && defaultValue === null) {
    console.warn(`Environment variable VITE_${key} is not set`);
  }
  return value;
};

export const config = {
  supabase: {
    url: getEnvVariable('SUPABASE_URL'),
    anonKey: getEnvVariable('SUPABASE_ANON_KEY'),
  },
  app: {
    name: getEnvVariable('APP_NAME', 'Spectrum Hub'),
    sessionTimeout: parseInt(getEnvVariable('SESSION_TIMEOUT', '3600000')), // 1 hour
  },
  security: {
    secureCookie: getEnvVariable('SECURE_COOKIE', 'true') === 'true',
    tokenRefreshInterval: 5 * 60 * 1000, // 5 minutes
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },
};

// Validate required config
export const validateConfig = () => {
  const required = ['supabase.url', 'supabase.anonKey'];
  const missing = required.filter(key => {
    const [parent, child] = key.split('.');
    return !config[parent]?.[child];
  });

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
};

export default config;