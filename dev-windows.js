// Windows-compatible development script
process.env.NODE_ENV = 'development';

// Import and run the server
import('./server/index.ts').catch(console.error);