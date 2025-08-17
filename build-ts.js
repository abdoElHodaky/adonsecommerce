import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Building TypeScript files...');

// Ensure the build directory exists
if (!fs.existsSync('build')) {
  fs.mkdirSync('build', { recursive: true });
}

try {
  // Run TypeScript compiler
  execSync('npx tsc', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful!');
  
  // Copy non-TypeScript files to build directory
  console.log('Copying non-TypeScript files...');
  
  // Function to recursively copy files
  function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else if (!entry.name.endsWith('.ts') && !entry.name.endsWith('.tsx')) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  
  // Directories to copy
  const dirsToCopy = [
    'resources',
    'public',
    'config',
  ];
  
  for (const dir of dirsToCopy) {
    if (fs.existsSync(dir)) {
      copyDir(dir, path.join('build', dir));
    }
  }
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
