import { execSync } from 'child_process';

// Generate an app key if needed
try {
  console.log('Generating app key...');
  execSync('node ace generate:key', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to generate app key:', error);
}

// Start the server
try {
  console.log('Starting server...');
  execSync('node ace serve --watch', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to start server:', error);
}

