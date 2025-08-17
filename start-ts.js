import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting server with ts-node...');

try {
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

  // Start the server using ts-node
  console.log('Starting server with ts-node...');
  execSync('npx ts-node --esm server.ts', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      TS_NODE_PROJECT: path.join(__dirname, 'tsconfig.json'),
      TS_NODE_TRANSPILE_ONLY: 'true',
    }
  });
} catch (error) {
  console.error('❌ Server startup failed:', error);
  process.exit(1);
}
