// Environment configuration
type EnvConfig = {
    pusherKey: string;
    pusherCluster: string;
};

// Default values (these should be overridden by environment variables in production)
const config: EnvConfig = {
    pusherKey: import.meta.env.VITE_PUSHER_APP_KEY || '',
    pusherCluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
};

export default config;
