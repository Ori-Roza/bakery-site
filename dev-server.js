#!/usr/bin/env node
/**
 * Local Development Server with Mocked Database
 * Serves static files and injects mock Supabase client into the page
 * 
 * Usage: node dev-server.js
 * Then open http://localhost:3000 in your browser
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createSqliteSupabaseClient } from './tests/helpers/sqliteSupabaseMock.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Initialize mock database once
let mockDbClient = null;

const initializeMockDb = async () => {
  if (mockDbClient) return mockDbClient;
  
  console.log('🗄️  Initializing mock SQLite database...');
  
  mockDbClient = await createSqliteSupabaseClient({
    seed: true,
    users: [
      { id: 'admin-1', email: 'admin@bakery.local', password: 'admin123' }
    ]
  });
  
  console.log('✅ Mock database ready with sample data:');
  console.log('   - 2 Categories (חלה, עוגות)');
  console.log('   - 2 Products (חלה קלועה, עוגת שוקולד)');
  console.log('   - Site metadata');
  
  return mockDbClient;
};

const server = http.createServer(async (req, res) => {
  try {
    const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    // Security check: prevent directory traversal
    const realPath = path.resolve(filePath);
    if (!realPath.startsWith(path.resolve(__dirname))) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    
    const stats = fs.statSync(filePath);
    
    if (!stats.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    let data = fs.readFileSync(filePath);
    const ext = path.extname(filePath);
    
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.ts': 'application/typescript'
    };

    // Inject mock DB script into HTML files in dev mode
    if (ext === '.html' && filePath.includes('index.html')) {
      await initializeMockDb();
      const htmlContent = data.toString();
      
      // Inject mock DB client setup before closing </head> tag
      // This uses a simpler approach that works with the existing SupabaseClient.ts
      const mockDbScript = `
        <script type="module">
          // Import the mock client creator
          import { createSqliteSupabaseClient } from '/tests/helpers/sqliteSupabaseMock.js';
          
          // Initialize and inject mock client
          (async () => {
            try {
              const mockClient = await createSqliteSupabaseClient({ seed: true });
              
              // Inject as the Supabase client
              window.__SUPABASE_CLIENT__ = mockClient;
              window.__MOCK_MODE__ = true;
              
              console.log('%c🔧 Running in MOCK MODE with SQLite database', 'color: #ff6b6b; font-weight: bold; font-size: 14px');
              console.log('Available tables: categories, products, orders, site_metadata, profiles');
            } catch (error) {
              console.error('Failed to initialize mock database:', error);
            }
          })();
        </script>
      `;
      
      const modifiedHtml = htmlContent.replace('</head>', mockDbScript + '\n</head>');
      data = Buffer.from(modifiedHtml);
    }

    res.writeHead(200, { 
      'Content-Type': contentTypes[ext] || 'application/octet-stream',
      'Content-Length': data.length,
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.writeHead(404);
      res.end('Not found');
    } else {
      console.error('Server error:', err);
      res.writeHead(500);
      res.end('Internal server error');
    }
  }
});

// Try to listen on the specified port, or find an available one
const tryListen = (port) => {
  server.listen(port, () => {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   BAKERY SITE - LOCAL DEV SERVER      ║');
    console.log('╚════════════════════════════════════════╝\n');
    console.log(`✓ Server running at http://localhost:${port}`);
    console.log('✓ Using mock SQLite database with sample data');
    console.log('✓ No Supabase credentials needed\n');
    console.log('📝 Sample Data:');
    console.log('   Categories: חלה, עוגות');
    console.log('   Products: חלה קלועה, עוגת שוקולד\n');
    console.log('Press Ctrl+C to stop the server\n');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} is already in use, trying ${port + 1}...`);
      server.close();
      tryListen(port + 1);
    } else {
      console.error('❌ Server error:', err.message);
      process.exit(1);
    }
  });
};

tryListen(PORT);
