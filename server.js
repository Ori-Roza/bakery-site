#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  try {
    const stats = fs.statSync(filePath);
    
    if (!stats.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const data = fs.readFileSync(filePath);
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
      '.webp': 'image/webp'
    };

    res.writeHead(200, { 
      'Content-Type': contentTypes[ext] || 'application/octet-stream',
      'Content-Length': data.length,
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  } catch (err) {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server ready at http://192.168.1.111:${PORT}`);
  console.log(`✓ You can now open it in Safari on your iPhone`);
});
