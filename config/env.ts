// Environment configuration with fallbacks
export const ENV = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here',
};

// Check if environment variables are properly configured
export const isEnvConfigured = () => {
  const hasUrl = ENV.SUPABASE_URL && ENV.SUPABASE_URL !== 'https://your-project.supabase.co';
  const hasKey = ENV.SUPABASE_ANON_KEY && ENV.SUPABASE_ANON_KEY !== 'your-anon-key-here';
  
  return hasUrl && hasKey;
};

// Get environment status for debugging
export const getEnvStatus = () => {
  return {
    hasUrl: !!ENV.SUPABASE_URL,
    hasKey: !!ENV.SUPABASE_ANON_KEY,
    isConfigured: isEnvConfigured(),
    url: ENV.SUPABASE_URL,
    key: ENV.SUPABASE_ANON_KEY ? '***' + ENV.SUPABASE_ANON_KEY.slice(-4) : 'missing',
  };
}; 