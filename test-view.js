import { Edge } from 'edge.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testViewRendering() {
  try {
    console.log('Creating Edge instance...');
    const edge = new Edge({ cache: false });
    
    const viewsPath = join(__dirname, 'resources/views');
    console.log('Mounting views path:', viewsPath);
    edge.mount(viewsPath);
    
    console.log('Adding global helpers...');
    edge.global('currentYear', () => new Date().getFullYear());
    edge.global('appUrl', (path) => `http://localhost:3333${path}`);
    edge.global('auth', {
      isLoggedIn: false,
      user: null
    });
    
    // Check if views directory exists
    console.log('Checking if views directory exists...');
    if (!fs.existsSync(viewsPath)) {
      console.log('Creating views directory...');
      fs.mkdirSync(viewsPath, { recursive: true });
    }
    
    // Create a test view if it doesn't exist
    const pagesPath = join(viewsPath, 'pages');
    if (!fs.existsSync(pagesPath)) {
      console.log('Creating pages directory...');
      fs.mkdirSync(pagesPath, { recursive: true });
    }
    
    const testViewPath = join(pagesPath, 'test.edge');
    if (!fs.existsSync(testViewPath)) {
      console.log('Creating test view...');
      fs.writeFileSync(testViewPath, `
<!DOCTYPE html>
<html>
<head>
  <title>Test View</title>
</head>
<body>
  <h1>Test View</h1>
  <p>Current Year: {{ currentYear() }}</p>
  <p>App URL: {{ appUrl('/test') }}</p>
</body>
</html>
      `);
    }
    
    // List available views
    console.log('Available views:');
    function listFiles(dir, prefix = '') {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          console.log(`${prefix}📁 ${file}/`);
          listFiles(filePath, prefix + '  ');
        } else {
          console.log(`${prefix}📄 ${file}`);
        }
      });
    }
    
    if (fs.existsSync(viewsPath)) {
      listFiles(viewsPath);
    }
    
    // Try to render the test page
    console.log('Rendering test view...');
    const html = await edge.render('pages/home');
    
    console.log('View rendered successfully!');
    console.log('HTML output length:', html.length);
    console.log('First 500 characters:');
    console.log(html.substring(0, 500));
    
    return true;
  } catch (error) {
    console.error('Error rendering view:', error);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run the test
testViewRendering().then(success => {
  if (success) {
    console.log('✅ View test passed!');
  } else {
    console.log('❌ View test failed!');
    process.exit(1);
  }
});
