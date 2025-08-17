import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if .env file exists
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('Creating .env file from .env.example...');
  try {
    const envExample = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf8');
    
    // Add APP_KEY if not present
    let envContent = envExample;
    if (!envContent.includes('APP_KEY=')) {
      envContent += '\nAPP_KEY=base64:uXUxNnC2ywg0PAlImQ7ALQxYV3lNpRmX';
    }
    
    // Add LOG_LEVEL if not present
    if (!envContent.includes('LOG_LEVEL=')) {
      envContent += '\nLOG_LEVEL=info';
    }
    
    fs.writeFileSync(path.join(__dirname, '.env'), envContent);
    console.log('✅ .env file created successfully!');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error);
    process.exit(1);
  }
}

// Generate app key if not already set
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
