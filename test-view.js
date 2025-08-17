import { Edge } from 'edge.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

//const __filename = fileURLToPath("./");
//const __dirname = dirname(__filename);

async function testViewRendering() {
  try {
    // Create a new Edge instance
    const edge = new Edge({ cache: false });
    
    // Register the views directory as the default namespace
    edge.mount('./resources/views');
    
    // Add global helpers
    edge.global('currentYear', () => new Date().getFullYear());
    edge.global('auth', {
      isLoggedIn: false,
      user: null
    });
    
    // Try to render the home page
    const html = await edge.render('welcomer');
    
    console.log('View rendered successfully!');
    console.log('HTML output length:', html.length);
    console.log('First 500 characters:');
    console.log(html.substring(0, 500));
    
    return true;
  } catch (error) {
    console.error('Error rendering view:', error);
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
